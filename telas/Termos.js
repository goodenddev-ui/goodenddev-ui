import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

export default function Termo({ route, navigation }) {
  const { id_usuario } = route.params; // Recebe o ID do usuário via parâmetro
  const scrollViewRef = useRef(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [scrollReachedBottom, setScrollReachedBottom] = useState(false);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isBottom && !scrollReachedBottom) {
      setScrollReachedBottom(true);
      setButtonEnabled(true);
    }
  };

  const aceitarTermos = async () => {
    try {
      const response = await axios.post(`https://viaclasse.net/api/aceitar_termos.php?id_usuario=${id_usuario}`);
      if (response.data?.status === 'ok') {
        Alert.alert('Sucesso', 'Termos aceitos com sucesso.');
        navigation.replace("Home");
      } else {
        Alert.alert('Erro', 'Não foi possível registrar sua aceitação.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.termoBox}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        ref={scrollViewRef}
      >
        <Text style={styles.termoTexto}>
          {`📄 Termo de Uso do Aparelho Celular para Registro de Ponto

Bem-vindo ao Seu Ponto!

Antes de começar a utilizar o aplicativo, é importante que você leia e aceite os termos abaixo:

1. Finalidade do Uso
Este aplicativo será utilizado para o registro de jornada de trabalho (entrada, pausa, retorno e saída), conforme legislação vigente e políticas internas da empresa.

2. Uso do Dispositivo Pessoal
Ao aceitar este termo, você concorda em utilizar seu aparelho celular pessoal para realizar os registros de ponto, de forma voluntária e consciente.

3. Coleta de Dados
O aplicativo pode coletar e registrar:
- Data e hora do registro de ponto.
- Geolocalização (caso autorizado).
- Identificação do dispositivo.
Esses dados serão utilizados exclusivamente para fins de controle de jornada e auditoria.

4. Sem Ônus para o Empregador
O uso do aplicativo no seu dispositivo não gerará qualquer compensação financeira ou reembolso, salvo se expressamente previsto em contrato ou política da empresa.

5. Segurança e Privacidade
O app segue boas práticas de segurança da informação. Nenhum dado pessoal será compartilhado com terceiros, exceto quando exigido por lei ou ordem judicial.

6. Consentimento
O uso do aplicativo está condicionado à aceitação destes termos. Caso não concorde, o uso do sistema não será liberado e outras alternativas de controle de jornada poderão ser avaliadas com o setor responsável.

Ao clicar em “Li e Concordo”, você declara estar ciente e de acordo com os termos acima.`}
        </Text>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.button, buttonEnabled ? styles.buttonEnabled : styles.buttonDisabled]}
        onPress={aceitarTermos}
        disabled={!buttonEnabled}
      >
        <Text style={styles.buttonText}>Li e Concordo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  termoBox: {
    flex: 1,
    marginBottom: 20,
  },
  termoTexto: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
