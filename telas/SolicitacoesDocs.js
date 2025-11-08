import React, { useState, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const SolicitacoesDocs = ({ navigation }) => {
  const [id_user, setId_user] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const webviewRef = useRef(null);

  const retrieveData = async () => {
    const userId = await AsyncStorage.getItem("id_user");
    setId_user(userId);
    console.log("id_user:", userId);
  };

  // Toda vez que a tela é aberta/focada, recarrega usuário e WebView
  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        await retrieveData();
        setRefreshKey(prev => prev + 1); // força reload da WebView
      };
      load();
    }, [])
  );

  const url = id_user
    ? `https://viaclasse.net/api/solicitacoes_docs.php?id_user=${id_user}`
    : null;

  if (!id_user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#008080" />
        <Text style={{ marginTop: 10, color: "#555" }}>Carregando usuário...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        key={refreshKey}                   // força WebView recarregar
        ref={webviewRef}
        source={{ uri: url }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        renderLoading={() => (
          <ActivityIndicator size="large" color="#008080" style={{ flex: 1 }} />
        )}
        mediaPlaybackRequiresUserAction={false}
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
        onPress={() => navigation.navigate("Início")}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Voltar para Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SolicitacoesDocs;
