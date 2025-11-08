import React, { useState, useEffect, useRef } from "react";
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Login from "./telas/Login";
import Home from "./telas/Home";
import Notificacoes from "./telas/Notificacoes";
import EditarPerfil from "./telas/EditarPerfil";
import Comprovante from "./telas/Comprovante";
import Documentos from "./telas/Documentos";
import Frequencia from "./telas/Frequencia";
import Termos from "./telas/Termos";
import VerFolha from "./telas/VerFolha";
import CanaisWhatsapp from "./telas/CanaisWhatsapp";
import RotaOnibus from "./telas/RotaOnibus";
import SolicitacoesDocs from "./telas/SolicitacoesDocs";
import VincularAluno from "./telas/VincularAluno";
import Cadastro from "./telas/Cadastro";
import { Platform } from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Falhou em receber o token de push para notificação de push!');
      //return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log("APP.JS", token);
  } else {
    console.log('Deve usar um dispositivo físico para notificações push.');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  
    // Listener de notificação recebida
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
  
    // Listener de resposta à notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
  
    // Remoção dos listeners no unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
  

  if (expoPushToken && expoPushToken.data) {
    const objectAsString = JSON.stringify(expoPushToken.data);
    console.log("APPPADDDD: " + objectAsString);
    AsyncStorage.setItem("token", objectAsString);
  } else {
    console.log("expoPushToken ou expoPushToken.data é indefinido.");
  }
  


  return (
    <SafeAreaView
    style={{ flex: 1, backgroundColor: "#fff" }}
    edges={["bottom"]} // 👈 apenas área inferior
  >
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="EditarPerfil"
          component={EditarPerfil}
          options={{
            title: "",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 20,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />

      <Stack.Screen
          name="Comprovante"
          component={Comprovante}
          options={{
            title: "",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 20,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />


        <Stack.Screen
          name="Notificacoes"
          component={Notificacoes}
          options={{
            title: "Minhas Notificações",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 20,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />


        <Stack.Screen
          name="Enviar Documentos"
          component={Documentos}
          options={{
            title: "Enviar Documentos",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 10,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />


        <Stack.Screen
          name="Frequencia"
          component={Frequencia}
          options={{
            title: "Folha de Ponto",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 10,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />

        <Stack.Screen
          name="Termos"
          component={Termos}
          options={{
            title: "Termos de Uso do Aparelho",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 10,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />

        <Stack.Screen
          name="VerFolha"
          component={VerFolha}
          options={{
            title: "",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 12,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />

        <Stack.Screen
          name="CanaisWhatsapp"
          component={CanaisWhatsapp}
          options={{
            title: "Atendimento via Whatsapp",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 18,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />

        <Stack.Screen
          name="RotaOnibus"
          component={RotaOnibus}
          options={{
            title: "Rota do Ônibus",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 18,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />

        <Stack.Screen
          name="SolicitacoesDocs"
          component={SolicitacoesDocs}
          options={{
            title: "Solicitações de Documentos",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 18,
              textAlign: "left",
              fontFamily: 'BlinkerSemiBold',
            },
          }}
        />


        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{
            title: "Cadastro de Responsável",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 15,
              textAlign: "left",
              fontFamily: "BlinkerSemiBold",
            },
          }}
        />

        <Stack.Screen
          name="VincularAluno"
          component={VincularAluno}
          options={{
            title: "Vincular Aluno ao Responsável",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 15,
              textAlign: "left",
              fontFamily: "BlinkerSemiBold",
            },
          }}
        />



        

      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
