import React, { useState, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const Notificacoes = ({ navigation }) => {
  const [id_user, setId_user] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const webviewRef = useRef(null);

  const retrieveData = async () => {
    const userId = await AsyncStorage.getItem("id_user");
    setId_user(userId);
    console.log("id_user:", userId);
  };

  // Toda vez que a tela é aberta/focada, recarrega dados e WebView
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await retrieveData();
        setRefreshKey(prev => prev + 1); // força WebView recarregar
      };
      fetchData();
    }, [])
  );

  const url = id_user
    ? `https://viaclasse.net/api/notificacoes.php?id_user=${id_user}`
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
        key={refreshKey}                 // força reload sempre que refreshKey mudar
        ref={webviewRef}
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#008080" style={{ flex: 1 }} />
        )}
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

export default Notificacoes;
