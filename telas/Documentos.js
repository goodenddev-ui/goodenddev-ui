import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, Image, Alert, ActivityIndicator, 
  TouchableHighlight, TextInput, StyleSheet 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";

const Documentos = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idUser, setIdUser] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [observacao, setObservacao] = useState("");

  const [open, setOpen] = useState(false);
  const [documentos, setDocumentos] = useState([
    { label: "Atestado Médico", value: "atestado" },
    { label: "Justificativa de Falta", value: "justificativa" },
    { label: "Comprovante de Residência", value: "comprovante_residencia" },
    { label: "Declaração de Dependentes", value: "declaracao_dependentes" },
    { label: "Comprovante de Férias", value: "comprovante_ferias" },
    { label: "Documento de Identidade (RG/CPF)", value: "identidade" },
    { label: "Contrato de Trabalho", value: "contrato_trabalho" },
    { label: "Termo de Rescisão", value: "termo_rescisao" },
    { label: "Declaração de Treinamento", value: "declaracao_treinamento" },
    { label: "Holerite", value: "holerite" },
    { label: "Declaração de Ponto", value: "declaracao_ponto" },
    { label: "Laudo Médico (PCD)", value: "laudo_medico_pcd" },
    { label: "Pedido de Vale-Transporte", value: "vale_transporte" },
    { label: "Pedido de Vale-Alimentação", value: "vale_alimentacao" },
    { label: "Outros", value: "outros" }
]);


  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem("id_user");
        if (storedId) {
          setIdUser(storedId);
        } else {
          Alert.alert("Erro", "ID do usuário não encontrado.");
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível recuperar o ID do usuário.");
      }
    };
    fetchUserId();

    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Não foi possível acessar a localização.");
        return;
      }
      try {
        let localizacao = await Location.getCurrentPositionAsync({});
        if (localizacao?.coords) {
          const coordenadas = `${localizacao.coords.latitude}, ${localizacao.coords.longitude}`;
          setCoordenadas(coordenadas);
        } else {
          Alert.alert("Erro", "Não foi possível obter sua localização.");
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível obter sua localização.");
      }
    };

    fetchLocation();
  }, []);

  const capturarFoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhoto(null);
      };
    }, [])
  );

  const enviarDados = async () => {
    if (!photo || !coordenadas || !idUser || !tipoDocumento) {
      let mensagemErro = "Preencha os seguintes campos:\n";
  
      if (!photo) mensagemErro += "- Scanner do documento\n";
      if (!coordenadas) mensagemErro += "- Coordenadas\n";
      if (!idUser) mensagemErro += "- ID do Usuário\n";
      if (!tipoDocumento) mensagemErro += "- Tipo de Documento\n";
  
      Alert.alert("Atenção", mensagemErro);
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append("id_pessoa", idUser);
    formData.append("coordenadas", coordenadas);
    formData.append("tipo_documento", tipoDocumento);
    formData.append("observacao", observacao);
    formData.append("foto", {
      uri: photo,
      name: "foto.jpg",
      type: "image/jpeg",
    });
  
    console.log("Enviando dados para o servidor...");
    
    try {
      const response = await axios.post("https://viaclasse.net/api/enviarDoc.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // Aguarda a resposta ser completamente processada
      if (response?.data) {
        console.log("Resposta do servidor:", response.data);
        
        if (response.data.status === "sucesso") {
          Alert.alert("Sucesso", response.data.mensagem);
          navigation.replace("Home");
        } else {
          Alert.alert("Erro", response.data.mensagem || "Erro desconhecido.");
        }
      } else {
        Alert.alert("Erro", "Resposta inválida do servidor.");
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      Alert.alert("Erro", "Não foi possível enviar os dados.");
    } finally {
      setLoading(false);
    }
  };
  



  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent={false} backgroundColor="transparent" />

      <Image 
        source={photo ? { uri: photo } : require('../assets/scandoc-removebg-preview.png')} 
        style={styles.image} 
      />

      <TouchableHighlight
        style={styles.button}
        onPress={capturarFoto}
        underlayColor="#000"
      >
        <Text style={styles.buttonText}>Scannear</Text>
      </TouchableHighlight>

      <Text style={styles.label}>Tipo de Documento</Text>
      <DropDownPicker
        open={open}
        value={tipoDocumento}
        items={documentos}
        setOpen={setOpen}
        setValue={setTipoDocumento}
        setItems={setDocumentos}
        placeholder="Selecione um tipo"
        style={styles.picker}
        dropDownContainerStyle={{ backgroundColor: "#EFEFEF" }}
      />

      <Text style={styles.label}>Observação</Text>
      <TextInput
        placeholder="Digite observações..."
        multiline
        numberOfLines={2}
        value={observacao}
        onChangeText={setObservacao}
        style={styles.input}
      />

      <TouchableHighlight
        style={styles.buttonEnviar}
        onPress={enviarDados}
        disabled={loading}
        underlayColor="#000"
      >
        <Text style={styles.buttonTextEnviar}>Enviar</Text>
      </TouchableHighlight>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  image: {
    width: 230,
    height: 230,
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#008080",
    padding: 10,
    paddingStart: 40,
    paddingEnd: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: {
    color: "yellow",
    textAlign: "center",
    fontSize: 20,
  },
  label: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "#EFEFEF",
    marginVertical: 10,
    borderRadius: 5,
  },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 10,
    borderRadius: 5,
    padding: 5,
    textAlignVertical: "top",
    marginVertical: 10,
  },
  buttonEnviar: {
    backgroundColor: "#008080",
    padding: 10,
    paddingStart: 40,
    paddingEnd: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonTextEnviar: {
    color: "#000",
    textAlign: "center",
    fontSize: 20,
  },
});

export default Documentos;
