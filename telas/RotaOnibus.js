import React, { useState, useRef } from "react";
import { View, ActivityIndicator, RefreshControl, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";

export default function RotaOnibus({ route, navigation }) {
  const { onibus_escolar } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const webviewRef = useRef(null);

  const url = `https://viaclasse.net/api/ver_rota.php?id_rota=${onibus_escolar}`;

  const onRefresh = () => {
    setRefreshing(true);
    if (webviewRef.current) {
      webviewRef.current.reload(); // Recarrega a WebView
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#008080"
            style={{ flex: 1 }}
          />
        )}
        pullToRefreshEnabled={true} // Android
        overScrollMode="always"
        nestedScrollEnabled={true}
        // Para iOS precisamos usar RefreshControl no container
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#008080"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginLeft: -20,
            marginTop: -20,
          }}
        />
      )}

      {/* Botão de voltar para Home */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          backgroundColor: "#008080",
          paddingVertical: 10,
          paddingHorizontal: 30,
          borderRadius: 25,
          elevation: 5,
        }}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Voltar para Home</Text>
      </TouchableOpacity>
    </View>
  );
}
