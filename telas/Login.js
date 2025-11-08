import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Linking,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import fundoImage from "../assets/fundo.png";
import cornerImage from "../assets/logo_suprir.png";

const Login = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    BlinkerSemiBold: require("../assets/fonts/BlinkerSemiBold.ttf"),
    "BoxedRegular-Bold": require("../assets/fonts/BoxedRegular-Bold.ttf"),
    "Blinker-Regular": require("../assets/fonts/Blinker-Regular.ttf"),
    "Blinker-Light": require("../assets/fonts/Blinker-Light.ttf"),
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const name = await AsyncStorage.getItem("name");
    if (name !== null) {
      navigation.replace("Home");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    axios
      .post("https://viaclasse.net/api/login_responsaveis.php", {
        username: username,
        password: password,
      })
      .then(async function (response) {
        const data = response.data.split(";");

        if (data[0] === "success") {
          const [
            ,
            name,
            photo,
            id_user,
            primeiroNome,
            telefone,
            email,
            cpf,
            nascimento,
            endereco,
            cidade,
            estado,
            cep,
            ocupacao,
            parentesco,
            matriculas,
            data_cadastro,
            id_escola,
          ] = data;

          await AsyncStorage.multiSet([
            ["name", name],
            ["photo", "https://viaclasse.net/" + photo],
            ["id_user", id_user],
            ["primeiroNome", primeiroNome],
            ["telefone", telefone],
            ["email", email],
            ["cpf", cpf],
            ["nascimento", nascimento],
            ["endereco", endereco],
            ["cidade", cidade],
            ["estado", estado],
            ["cep", cep],
            ["ocupacao", ocupacao],
            ["parentesco", parentesco],
            ["matriculas_aluno", matriculas],
            ["data_cadastro", data_cadastro],
            ["id_escola", id_escola],
          ]);

          navigation.replace("Home");
        } else {
          Alert.alert("Atenção", "Dados incorretos. Tente novamente.");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleCadastro = () => {
    navigation.navigate("Cadastro");
  };

  const handleEsqueceuSenha = async () => {
  const url = "https://viaclasse.net/esqueceu_senha.php";
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert("Erro", "Não foi possível abrir o link.");
  }
};

  if (!fontsLoaded) return null;

  return (
    <ImageBackground source={fundoImage} style={styles.container} resizeMode="cover">
      <StatusBar style="auto" translucent={true} backgroundColor="transparent" />

      <View style={styles.centeredBox}>
        <Image source={require("../assets/logo.png")} style={styles.image} />

        <Text style={styles.title}>Bem-vindo</Text>

        <TextInputMask
          type={"cpf"}
          placeholder="CPF"
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholderTextColor="gray"
          style={styles.input}
        />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Senha"
            secureTextEntry={!showPassword}
            onChangeText={(text) => setPassword(text)}
            value={password}
            placeholderTextColor="gray"
            style={styles.input}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <TouchableHighlight
          style={styles.loginButton}
          onPress={handleLogin}
          underlayColor="#008080"
        >
          <Text style={styles.loginText}>ENTRAR</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.registerButton}
          onPress={handleCadastro}
          underlayColor="#E0E0E0"
        >
          <Text style={styles.registerText}>CADASTRE-SE</Text>
        </TouchableHighlight>

        <TouchableOpacity onPress={handleEsqueceuSenha}>
          <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>
        {Constants.expoConfig?.version || "1.0.0"}
      </Text>

      <View style={styles.cornerImage}>
        <Image source={cornerImage} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#033148",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 100,
  },
  title: {
    fontSize: 25,
    color: "#FFF",
    marginBottom: 0,
    fontFamily: "Blinker-Regular",
  },
  input: {
    width: "100%",
    textAlign: "center",
    backgroundColor: "#FFF",
    borderWidth: 0,
    borderRadius: 25,
    padding: 8,
    marginTop: 20,
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    paddingLeft: 20,
    paddingTop: 20,
    paddingEnd: 10,
  },
  loginButton: {
    backgroundColor: "#008080",
    padding: 10,
    marginTop: 20,
    paddingStart: 40,
    paddingEnd: 40,
    borderRadius: 30,
    marginBottom: 10,
  },
  loginText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 20,
    fontFamily: "BlinkerSemiBold",
  },
  registerButton: {
    backgroundColor: "#FFF",
    padding: 10,
    paddingStart: 40,
    paddingEnd: 40,
    borderRadius: 30,
    marginBottom: 10,
  },
  registerText: {
    color: "#008080",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "BlinkerSemiBold",
  },
  forgotText: {
    color: "#FFF",
    textDecorationLine: "underline",
    fontFamily: "Blinker-Light",
    marginTop: 5,
  },
  versionText: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 12,
    zIndex: 99,
    color: "#FFF",
  },
  cornerImage: {
    position: "absolute",
    borderRadius: 10,
    padding: 10,
    bottom: 10,
    right: 10,
    height: 60,
    zIndex: 99,
    opacity: 0.8,
  },
});

export default Login;
