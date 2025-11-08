import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Image, Pressable, 
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, 
  Alert, ScrollView, Platform 
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditarPerfil = ({ navigation }) => {
  const [id_user, setId_user] = useState('');
  const [username, setNomeUser] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [password, setPassword] = useState('');
  const [photo_perfil, setPhotoPerfil] = useState('');
  const [aceitou_termos, setAceitouTermos] = useState('');

  const retrieveData = async () => {
    const id_user = await AsyncStorage.getItem("id_user");
    const nome_user = await AsyncStorage.getItem("name");
    const telefone = await AsyncStorage.getItem("telefone");
    const email = await AsyncStorage.getItem("email");
    const equipamento = await AsyncStorage.getItem("equipamento");
    const photo_perfil = await AsyncStorage.getItem("photo");
    const aceitou_termos = await AsyncStorage.getItem("aceitou_termos");

    setId_user(id_user);
    setNomeUser(nome_user);
    setTelefone(telefone);
    setEmail(email);
    setEquipamento(equipamento);
    setPhotoPerfil(photo_perfil);
    setAceitouTermos(aceitou_termos);

    console.log("PHOTO:", photo_perfil);
  };

  useFocusEffect(
    React.useCallback(() => {
      retrieveData();
    }, [])
  );

  const sair = async () => {
    try {
      await AsyncStorage.multiRemove([
        "name",
        "photo",
        "id_user",
        "email",
        "telefone",
        "equipamento",
        "aceitou_termos",
        "primeiroNome",
        "cpf",
        "nascimento",
        "endereco",
        "cidade",
        "estado",
        "cep",
        "ocupacao",
        "parentesco",
        "matriculas_aluno",
        "data_cadastro",
      ]);
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Erro ao sair", e.message);
    }
  };

  const handleSubmit = async () => {
    if (!telefone) return Alert.alert('Ops!!','O campo telefone está vazio!');
    if (!email) return Alert.alert('Ops!!','O campo e-mail está vazio!');
    if (!password) return Alert.alert('Ops!!','O campo senha está vazio!');

    try {
      const response = await fetch('https://viaclasse.net/api/editar_func.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_user=${id_user}&telefone=${telefone}&email=${email}&password=${password}`,
      });

      const data = await response.json();

      if (data.success == 1) {
        await AsyncStorage.setItem("name", username);
        await AsyncStorage.setItem("telefone", telefone);
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("aceitou_termos", aceitou_termos);

        Alert.alert('Tudo certo!', 'Seus dados foram atualizados');
        navigation.navigate('Home');
      } else {
        Alert.alert('Ops!!', data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar as alterações.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <View style={{ justifyContent: 'space-around' }}>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Image
                    source={
                    photo_perfil
                        ? { uri: photo_perfil }
                        : require("../assets/avatar.jpg")
                    }
                    style={{ width: 45, height: 45, borderRadius: 22.5, marginRight: 10 }}
                />
                <Text style={[styles.label, { fontSize: 20 }]}>{username}</Text>
            </View>


            <Text style={styles.label}>Telefone</Text>
            <TextInput
              placeholder="(xx) xxxxx-xxxx"
              value={telefone}
              maxLength={15}
              onChangeText={setTelefone}
              keyboardType="numeric"
              style={styles.textInput}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              placeholder="marcelo@site.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.textInput}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              style={styles.textInput}
            />

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.text}>Salvar</Text>
            </Pressable>

            <Pressable style={styles.button3} onPress={sair}>
              <Text style={styles.text3}>SAIR DA CONTA</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  textInput: {
    height: 50,
    marginVertical: 10,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    backgroundColor: '#0a924b',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  button3: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
    borderColor: '#FFF',
    borderWidth: 1,
    elevation: 3,
    backgroundColor: '#DE3511',
  },
  text3: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: '#FFF',
  },
});

export default EditarPerfil;
