package com.codextestzone.bladeboxarena;

import android.content.Context;
import android.net.wifi.WifiManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONObject;

@CapacitorPlugin(name = "LocalNetwork")
public class LocalNetworkPlugin extends Plugin {
    private static final int DEFAULT_PORT = 7777;
    private static final int DISCOVERY_PORT = 7778;
    private static final String DISCOVERY_GAME_ID = "blade-box-arena";

    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final AtomicInteger nextClientId = new AtomicInteger(1);
    private final Map<Integer, PeerConnection> hostClients = new ConcurrentHashMap<>();
    private final AtomicBoolean hostRunning = new AtomicBoolean(false);
    private final AtomicBoolean clientRunning = new AtomicBoolean(false);
    private final AtomicBoolean discoveryBroadcastRunning = new AtomicBoolean(false);
    private final AtomicBoolean discoveryListenRunning = new AtomicBoolean(false);

    private ServerSocket serverSocket;
    private PeerConnection clientConnection;
    private DatagramSocket discoveryBroadcastSocket;
    private DatagramSocket discoveryListenSocket;
    private WifiManager.MulticastLock multicastLock;

    @PluginMethod
    public void startHost(PluginCall call) {
        int port = call.getInt("port", DEFAULT_PORT);
        stopHostInternal(false);
        stopClientInternal(false);

        try {
            serverSocket = new ServerSocket(port);
            hostRunning.set(true);
            nextClientId.set(1);
            executor.execute(this::acceptLoop);

            JSObject ret = new JSObject();
            ret.put("port", port);
            ret.put("ip", getLocalIpAddressValue());
            call.resolve(ret);
            emitStatus("hostStarted", ret);
        } catch (IOException error) {
            hostRunning.set(false);
            call.reject("Unable to start host server: " + error.getMessage(), error);
        }
    }

    @PluginMethod
    public void stopHost(PluginCall call) {
        stopHostInternal(true);
        call.resolve();
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String host = call.getString("host", "");
        int port = call.getInt("port", DEFAULT_PORT);
        if (host.trim().isEmpty()) {
            call.reject("Host IP is required");
            return;
        }

        stopClientInternal(false);
        stopHostInternal(false);

        executor.execute(() -> {
            try {
                Socket socket = new Socket();
                socket.setTcpNoDelay(true);
                socket.connect(new InetSocketAddress(host.trim(), port), 5000);
                PeerConnection connection = new PeerConnection(0, socket, false);
                clientConnection = connection;
                clientRunning.set(true);
                executor.execute(() -> readClientLoop(connection));

                JSObject ret = new JSObject();
                ret.put("host", host.trim());
                ret.put("port", port);
                call.resolve(ret);
                emitStatus("clientConnected", ret);
            } catch (IOException error) {
                clientRunning.set(false);
                call.reject("Unable to connect: " + error.getMessage(), error);
            }
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        stopClientInternal(true);
        call.resolve();
    }

    @PluginMethod
    public void send(PluginCall call) {
        String message = call.getString("message", "");
        Integer clientId = call.getInt("clientId");
        if (message.isEmpty()) {
            call.reject("Message is required");
            return;
        }

        if (hostRunning.get()) {
            if (clientId != null) {
                PeerConnection connection = hostClients.get(clientId);
                if (connection == null) {
                    call.reject("Unknown client id: " + clientId);
                    return;
                }
                connection.send(message);
            } else {
                for (PeerConnection connection : hostClients.values()) {
                    connection.send(message);
                }
            }
            call.resolve();
            return;
        }

        if (clientRunning.get() && clientConnection != null) {
            clientConnection.send(message);
            call.resolve();
            return;
        }

        call.reject("No active network connection");
    }

    @PluginMethod
    public void disconnectClient(PluginCall call) {
        Integer clientId = call.getInt("clientId");
        if (clientId == null) {
            call.reject("clientId is required");
            return;
        }

        PeerConnection connection = hostClients.remove(clientId);
        if (connection != null) {
            connection.close();
            emitClientDisconnected(clientId);
        }
        call.resolve();
    }

    @PluginMethod
    public void getLocalIpAddress(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("ip", getLocalIpAddressValue());
        call.resolve(ret);
    }

    @PluginMethod
    public void startDiscoveryBroadcast(PluginCall call) {
        int hostPort = call.getInt("hostPort", DEFAULT_PORT);
        int discoveryPort = call.getInt("discoveryPort", DISCOVERY_PORT);
        String lobbyName = call.getString("name", "Blade Box Lobby");
        stopDiscoveryBroadcastInternal(false);

        discoveryBroadcastRunning.set(true);
        executor.execute(() -> discoveryBroadcastLoop(hostPort, discoveryPort, lobbyName));

        JSObject ret = new JSObject();
        ret.put("discoveryPort", discoveryPort);
        ret.put("hostPort", hostPort);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopDiscoveryBroadcast(PluginCall call) {
        stopDiscoveryBroadcastInternal(true);
        call.resolve();
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        int discoveryPort = call.getInt("discoveryPort", DISCOVERY_PORT);
        stopDiscoveryInternal(false);

        discoveryListenRunning.set(true);
        acquireMulticastLock();
        executor.execute(() -> discoveryListenLoop(discoveryPort));

        JSObject ret = new JSObject();
        ret.put("discoveryPort", discoveryPort);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        stopDiscoveryInternal(true);
        call.resolve();
    }

    private void acceptLoop() {
        while (hostRunning.get() && serverSocket != null && !serverSocket.isClosed()) {
            try {
                Socket socket = serverSocket.accept();
                socket.setTcpNoDelay(true);
                int clientId = nextClientId.getAndIncrement();
                PeerConnection connection = new PeerConnection(clientId, socket, true);
                hostClients.put(clientId, connection);
                emitClientConnected(clientId, socket);
                executor.execute(() -> readHostClientLoop(connection));
            } catch (IOException error) {
                if (hostRunning.get()) {
                    JSObject data = new JSObject();
                    data.put("message", error.getMessage());
                    emitStatus("hostAcceptError", data);
                }
            }
        }
    }

    private void readHostClientLoop(PeerConnection connection) {
        try {
            String line;
            while (hostRunning.get() && (line = connection.reader.readLine()) != null) {
                JSObject data = new JSObject();
                data.put("clientId", connection.id);
                data.put("message", line);
                emit("message", data);
            }
        } catch (IOException ignored) {
            // Disconnect handling below is the only behavior needed by JS.
        } finally {
            hostClients.remove(connection.id);
            connection.close();
            emitClientDisconnected(connection.id);
        }
    }

    private void readClientLoop(PeerConnection connection) {
        try {
            String line;
            while (clientRunning.get() && (line = connection.reader.readLine()) != null) {
                JSObject data = new JSObject();
                data.put("message", line);
                emit("message", data);
            }
        } catch (IOException ignored) {
            // Disconnect handling below is the only behavior needed by JS.
        } finally {
            clientRunning.set(false);
            connection.close();
            if (clientConnection == connection) {
                clientConnection = null;
            }
            emitStatus("clientDisconnected", new JSObject());
        }
    }

    private void stopHostInternal(boolean notify) {
        hostRunning.set(false);
        stopDiscoveryBroadcastInternal(false);
        if (serverSocket != null) {
            try {
                serverSocket.close();
            } catch (IOException ignored) {
            }
            serverSocket = null;
        }

        for (PeerConnection connection : hostClients.values()) {
            connection.close();
        }
        hostClients.clear();

        if (notify) {
            emitStatus("hostStopped", new JSObject());
        }
    }

    private void stopClientInternal(boolean notify) {
        clientRunning.set(false);
        if (clientConnection != null) {
            clientConnection.close();
            clientConnection = null;
        }
        if (notify) {
            emitStatus("clientDisconnected", new JSObject());
        }
    }

    private void discoveryBroadcastLoop(int hostPort, int discoveryPort, String lobbyName) {
        try {
            discoveryBroadcastSocket = new DatagramSocket();
            discoveryBroadcastSocket.setBroadcast(true);
            InetAddress broadcastAddress = InetAddress.getByName("255.255.255.255");

            while (discoveryBroadcastRunning.get()) {
                JSONObject payload = new JSONObject();
                payload.put("game", DISCOVERY_GAME_ID);
                payload.put("version", 1);
                payload.put("name", lobbyName);
                payload.put("port", hostPort);
                payload.put("ip", getLocalIpAddressValue());
                byte[] bytes = payload.toString().getBytes(StandardCharsets.UTF_8);
                DatagramPacket packet = new DatagramPacket(bytes, bytes.length, broadcastAddress, discoveryPort);
                discoveryBroadcastSocket.send(packet);
                Thread.sleep(1000);
            }
        } catch (Exception error) {
            if (discoveryBroadcastRunning.get()) {
                JSObject data = new JSObject();
                data.put("message", error.getMessage());
                emitStatus("discoveryBroadcastError", data);
            }
        } finally {
            stopDiscoveryBroadcastInternal(false);
        }
    }

    private void discoveryListenLoop(int discoveryPort) {
        byte[] buffer = new byte[1024];
        try {
            discoveryListenSocket = new DatagramSocket(null);
            discoveryListenSocket.setReuseAddress(true);
            discoveryListenSocket.bind(new InetSocketAddress(discoveryPort));
            while (discoveryListenRunning.get()) {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                discoveryListenSocket.receive(packet);
                String message = new String(packet.getData(), packet.getOffset(), packet.getLength(), StandardCharsets.UTF_8);
                JSONObject payload = new JSONObject(message);
                if (!DISCOVERY_GAME_ID.equals(payload.optString("game"))) continue;

                JSObject data = new JSObject();
                data.put("ip", packet.getAddress().getHostAddress());
                data.put("advertisedIp", payload.optString("ip", ""));
                data.put("port", payload.optInt("port", DEFAULT_PORT));
                data.put("name", payload.optString("name", "Blade Box Lobby"));
                data.put("version", payload.optInt("version", 1));
                data.put("seenAt", System.currentTimeMillis());
                emit("lobbyDiscovered", data);
            }
        } catch (SocketException error) {
            if (discoveryListenRunning.get()) {
                JSObject data = new JSObject();
                data.put("message", error.getMessage());
                emitStatus("discoveryListenError", data);
            }
        } catch (Exception error) {
            if (discoveryListenRunning.get()) {
                JSObject data = new JSObject();
                data.put("message", error.getMessage());
                emitStatus("discoveryListenError", data);
            }
        } finally {
            stopDiscoveryInternal(false);
        }
    }

    private void stopDiscoveryBroadcastInternal(boolean notify) {
        discoveryBroadcastRunning.set(false);
        if (discoveryBroadcastSocket != null) {
            discoveryBroadcastSocket.close();
            discoveryBroadcastSocket = null;
        }
        if (notify) {
            emitStatus("discoveryBroadcastStopped", new JSObject());
        }
    }

    private void stopDiscoveryInternal(boolean notify) {
        discoveryListenRunning.set(false);
        if (discoveryListenSocket != null) {
            discoveryListenSocket.close();
            discoveryListenSocket = null;
        }
        releaseMulticastLock();
        if (notify) {
            emitStatus("discoveryStopped", new JSObject());
        }
    }

    private void acquireMulticastLock() {
        try {
            WifiManager wifiManager = (WifiManager) getContext().getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager == null) return;
            if (multicastLock == null) {
                multicastLock = wifiManager.createMulticastLock("BladeBoxArenaDiscovery");
                multicastLock.setReferenceCounted(false);
            }
            if (!multicastLock.isHeld()) {
                multicastLock.acquire();
            }
        } catch (Exception ignored) {
        }
    }

    private void releaseMulticastLock() {
        try {
            if (multicastLock != null && multicastLock.isHeld()) {
                multicastLock.release();
            }
        } catch (Exception ignored) {
        }
    }

    private void emitClientConnected(int clientId, Socket socket) {
        JSObject data = new JSObject();
        data.put("clientId", clientId);
        InetAddress address = socket.getInetAddress();
        data.put("ip", address != null ? address.getHostAddress() : "");
        emit("clientConnected", data);
    }

    private void emitClientDisconnected(int clientId) {
        JSObject data = new JSObject();
        data.put("clientId", clientId);
        emit("clientDisconnected", data);
    }

    private void emitStatus(String status, JSObject data) {
        data.put("status", status);
        emit("status", data);
    }

    private void emit(String eventName, JSObject data) {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(() -> notifyListeners(eventName, data));
    }

    private String getLocalIpAddressValue() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (!networkInterface.isUp() || networkInterface.isLoopback()) continue;

                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    if (address instanceof Inet4Address && !address.isLoopbackAddress()) {
                        return address.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return "Unavailable";
    }

    @Override
    protected void handleOnDestroy() {
        stopHostInternal(false);
        stopClientInternal(false);
        stopDiscoveryBroadcastInternal(false);
        stopDiscoveryInternal(false);
        executor.shutdownNow();
    }

    private static class PeerConnection {
        final int id;
        final Socket socket;
        final BufferedReader reader;
        final PrintWriter writer;

        PeerConnection(int id, Socket socket, boolean hostSide) throws IOException {
            this.id = id;
            this.socket = socket;
            this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            this.writer = new PrintWriter(socket.getOutputStream(), true);
        }

        void send(String message) {
            writer.println(message);
            writer.flush();
        }

        void close() {
            try {
                socket.close();
            } catch (IOException ignored) {
            }
        }
    }
}
