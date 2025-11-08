import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function CanaisWhatsapp({ route }) {
  const itemId = route?.params?.itemId || 'N/A';

  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarCanais = async () => {
      try {
        const id_escola = await AsyncStorage.getItem('id_escola');

        if (!id_escola) {
          console.warn('⚠️ id_escola não encontrado no AsyncStorage');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://viaclasse.net/api/canais_whatsapp.php?id_escola=${id_escola}`);
        const data = await response.json();

        setCanais(data);
      } catch (error) {
        console.error('Erro ao buscar canais:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCanais();
  }, []);

  const abrirWhatsapp = (numero, assunto) => {
    const mensagem = encodeURIComponent(`Olá! Gostaria de falar sobre: ${assunto}. Matrícula: ${itemId}`);
    const numeroLimpo = numero.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${numeroLimpo}?text=${mensagem}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Carregando canais de atendimento...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {canais.map((canal) => (
        <TouchableOpacity
          key={canal.id_canal}
          style={styles.botao}
          onPress={() => abrirWhatsapp(canal.whatsapp_canal, canal.assunto_canal)}
        >
          <View style={styles.botaoInterno}>
            <FontAwesome name="whatsapp" size={24} color="#fff" style={styles.icone} />
            <View>
              <Text style={styles.assunto}>{canal.assunto_canal}</Text>
              <Text style={styles.horario}>{canal.horarios_canal}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    alignItems: 'stretch',
  },
  botao: {
    backgroundColor: '#25D366',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  botaoInterno: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: {
    marginRight: 12,
  },
  assunto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  horario: {
    fontSize: 14,
    color: '#e0ffe0',
    marginTop: 4,
  },
});
