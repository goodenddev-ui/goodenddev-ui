import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const Comprovante = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const webviewRef = useRef(null);
  const { itemId } = route.params;
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    retrieveData();
  }, []);

  const retrieveData = async () => {
    const id_user = await AsyncStorage.getItem('id_user');
    const cliente_user = await AsyncStorage.getItem('cliente_user');
    setId_user(id_user);
    setCliente_user(cliente_user);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setRefreshing(false); // Para o ícone de refresh
  };

  const handleNavigationStateChange = (newNavState) => {
    const { url, loading } = newNavState;

    if (!loading) {
      if (url.match(/\.(pdf|png|jpg|jpeg|gif)$/i)) {
        Linking.openURL(url);
        webviewRef.current.stopLoading();
      } else if (url.startsWith('mailto:')) {
        Linking.openURL(url);
        webviewRef.current.stopLoading();
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    webviewRef.current?.reload();
  };

  const webviewUri = `https://viaclasse.net/api/comprovante_online.php?id=${itemId}`;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#033148']} />
        }
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
          </View>
        )}
        <WebView
          ref={webviewRef}
          style={styles.container}
          source={{ uri: webviewUri }}
          onLoadEnd={handleLoadEnd}
          onNavigationStateChange={handleNavigationStateChange}
          pullToRefreshEnabled={Platform.OS === 'android'} // Para Android (nativo do WebView)
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default Comprovante;
