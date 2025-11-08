import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  TouchableHighlight,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const RegistrarPonto = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [photo, setPhoto] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idUser, setIdUser] = useState(null);
  const [horario, setHorario] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const cameraRef = useRef(null);

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Não foi possível acessar a localização.");
      return;
    }

    try {
      let localizacao = await Location.getCurrentPositionAsync({});
      if (localizacao?.coords) {
        setCoordenadas(`${localizacao.coords.latitude}, ${localizacao.coords.longitude}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter sua localização.");
    }
  };

  const fetchUserId = async () => {
    try {
      const storedId = await AsyncStorage.getItem("id_user");
      if (storedId) setIdUser(storedId);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível recuperar o ID do usuário.");
    }
  };

  useEffect(() => {
    requestPermission();
    fetchUserId();
    fetchLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setHorario(
        now.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      setPhoto(photoData.uri);
      enviarDados(photoData.uri);
    }
  };

  const enviarDados = async (photo) => {
    if (!photo) {
      Alert.alert("Atenção", "Tire uma foto.");
      return;
    } else if (!coordenadas) {
      fetchLocation();
      return;
    } else if (!idUser) {
      Alert.alert("Atenção", "Tenha um ID válido antes de enviar.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("id_pessoa", idUser);
    formData.append("coordenadas", coordenadas);
    formData.append("foto", {
      uri: photo,
      name: "foto.jpg",
      type: "image/jpeg",
    });

    try {
      const response = await axios.post(
        "https://viaclasse.net/api/gravarPontoAppFunc.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.status === "sucesso") {
        Alert.alert("Sucesso", response.data.mensagem);
        navigation.replace("Home");
      } else {
        Alert.alert("Erro", response.data.mensagem || "Erro desconhecido.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        setPhoto(null);
      };
    }, [])
  );

  if (!permission) {
    return <ActivityIndicator size="large" color="#008080" />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permissão para acessar a câmera negada.</Text>
        <TouchableHighlight style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir Acesso</Text>
        </TouchableHighlight>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ height: StatusBar.currentHeight, backgroundColor: "#FFF" }}>
        <StatusBar
                style="light"
                translucent={true}
                backgroundColor="transparent"
              />
      </View>
      <Image source={require("../assets/logo.png")} style={styles.image} />
      
      <Text style={styles.title}>ENCAIXE SEU ROSTO</Text>

      <View style={styles.cameraContainer}>
        {isFocused && !photo ? (
          <View style={styles.maskWrapper}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            />
            <View style={{ flex: 1, position: "absolute" }}>
              <Image
                style={{ width: 300, height: 350 }}
                source={require("../assets/face.png")}
              />
            </View>
          </View>
        ) : (
          <View style={styles.maskWrapper}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.camera} />
            ) : null}
            <View style={{ flex: 1, position: "absolute" }}>
              <Image
                style={{ width: 300, height: 350 }}
                source={require("../assets/face.png")}
              />
            </View>
          </View>
        )}
      </View>

      <Text style={styles.horario}>Horário: {horario}</Text>

      <TouchableHighlight
        style={styles.button}
        onPress={handleTakePhoto}
        disabled={loading}
        underlayColor="#000"
      >
        <Text style={styles.buttonText}>Registrar Ponto</Text>
      </TouchableHighlight>

      {loading && <ActivityIndicator size="large" color="#008080" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: { fontSize: 20, marginTop: 10, fontWeight: "bold", marginBottom: 10, color: '#FFF' },
  cameraContainer: {
    width: 300,
    height: 350,
    overflow: "hidden",
    alignItems: "center",
  },
    image: {
    width: "80%",
    height: 100,
  },
  camera: { width: "100%", height: "100%" },
  maskWrapper: { width: 300, height: 350, position: "relative" },
  horario: { fontSize: 15, marginTop: 10, color: "#FFF" },
  button: {
    backgroundColor: "#008080",
    padding: 10,
    marginTop: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 10,
  },
  buttonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 20,
  },
});

export default RegistrarPonto;
