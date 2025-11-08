import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const VerFolha = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [id_user, setId_user] = useState(null);
  const [webviewUri, setWebviewUri] = useState(null);
  const [concordando, setConcordando] = useState(false); // controle do botão

  const { id_folha, inicial_periodo, final_periodo, status } = route.params;

  useEffect(() => {
    retrieveData();
  }, []);

  const retrieveData = async () => {
    try {
      const storedIdUser = await AsyncStorage.getItem('id_user');
      if (storedIdUser) {
        setId_user(storedIdUser);
        const uri = `https://viaclasse.net/admin/ver_folha.php?id_user=${storedIdUser}&id_folha=${id_folha}&inicial_periodo=${inicial_periodo}&final_periodo=${final_periodo}`;
        setWebviewUri(uri);
      } else {
        Alert.alert('ID do usuário não encontrado no armazenamento local.');
      }
    } catch (error) {
      Alert.alert('Erro ao carregar dados locais');
    } finally {
      setLoading(false);
    }
  };

  const handleConcordo = async () => {
    if (concordando) return;
    setConcordando(true);

    try {
      const response = await fetch(`https://viaclasse.net/api/assinar_folha.php?id_folha=${id_folha}`);
      const result = await response.json();

      if (result.success) {
        Alert.alert("Obrigado!", result.message || "");
        // Opcional: voltar para tela anterior após confirmação
        navigation.goBack();
      } else {
        Alert.alert("Erro ao assinar folha", result.message || "Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro de conexão", "Não foi possível se comunicar com o servidor.");
    } finally {
      setConcordando(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent={false} backgroundColor="#05072d" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      ) : (
        <>
          {webviewUri ? (
            <WebView
              source={{ uri: webviewUri }}
              style={{ flex: 1, marginBottom: status == 0 ? 60 : 0 }}
              onLoadEnd={() => setLoading(false)}
              javaScriptEnabled
              domStorageEnabled
            />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Erro ao carregar a folha.</Text>
          )}

          {status == 0 && (
            <View style={styles.botaoContainer}>
              <TouchableOpacity
                style={[styles.botaoConcordo, concordando && { opacity: 0.6 }]}
                onPress={handleConcordo}
                disabled={concordando}
              >
                <Text style={styles.botaoTexto}>
                  {concordando ? 'Enviando...' : 'APROVAR'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  botaoContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  botaoConcordo: {
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VerFolha;
