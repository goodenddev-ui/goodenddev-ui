import React, { useEffect, useState, useRef } from "react";
import { 
  createDrawerNavigator, 
  DrawerItemList 
} from "@react-navigation/drawer";
import { MaterialCommunityIcons, FontAwesome, MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Suas telas internas
import SolicitacoesDocs from "./SolicitacoesDocs";
import Notificacoes from "./Notificacoes";
import EditarPerfil from "./EditarPerfil";
import Frequencia from "./Frequencia";
import CanaisWhatsapp from "./CanaisWhatsapp";

const Drawer = createDrawerNavigator();

/**
 * Componente de layout global com topo fixo
 */
function LayoutComTopo({ navigation, children }) {
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight : 44;
  const [primeiroNome, setPrimeiroNome] = useState("Usuário");
  const [id_escola, setId_escola] = useState("");
  const [photoPerfil, setPhotoPerfil] = useState(null);
  

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const primeiroNome = await AsyncStorage.getItem("primeiroNome");
        const photo = await AsyncStorage.getItem("photo");
        const id_escola = await AsyncStorage.getItem("id_escola");

        console.log("ID_ESCOLA", id_escola);

        if (primeiroNome) setPrimeiroNome(primeiroNome);
        if (id_escola) setId_escola(id_escola);
        if (photo) setPhotoPerfil(photo);
      } catch (error) {
        console.error("Erro ao recuperar dados do usuário:", error);
      }
    }
    carregarUsuario();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Barra atrás do StatusBar */}
      <View style={{ height: statusBarHeight, backgroundColor: "#008080" }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* TOPO GLOBAL */}
      <View style={styles.topoUser}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ padding: 8 }}
        >
          <Ionicons name="menu" size={28} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.userText}>Olá, {primeiroNome}!</Text>

        <Image
          source={require("../assets/logo2.png")}
          style={styles.logoEmpresa}
        />
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/**
 * Tela genérica para envolver qualquer tela no layout
 */
function ComTela({ navigation, children }) {
  return <LayoutComTopo navigation={navigation}>{children}</LayoutComTopo>;
}

function TelaInicial({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [frequencias, setFrequencias] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [id_user, setId_user] = useState("");
  const [photo_perfil, setPhotoPerfil] = useState("");
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [matriculas, setMatriculas] = useState("");
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);

  console.log("MATRICULAS: ", matriculas);

  // Buscar frequências
  const getFrequencias = (matriculas) => {
    if (!matriculas || matriculas.trim() === "") return;

    setLoadingCards(true);
    fetch(`https://viaclasse.net/api/frequencias.php?matriculas=${matriculas}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("🔹 Frequências:", json);
        setFrequencias(json);
      })
      .catch((err) => console.error("Erro frequências:", err))
      .finally(() => setLoadingCards(false));
  };


  // Função para agrupar registros por matrícula e data
  function agruparFeed(feed = []) {
    if (!Array.isArray(feed)) return [];

    const agrupado = {};

    feed.forEach((item) => {
      const data = item.data_hora.split(" ")[0];
      const key = `${item.matricula}_${data}`;

      if (!agrupado[key]) {
        agrupado[key] = {
          id: item.id,
          matricula: item.matricula,
          nome: item.nome,
          data: data,
          entrada: null,
          saida: null,
          refeicao: null,
        };
      }

      if (item.entradaOUsaida === "Entrada") {
        agrupado[key].entrada = item.hora || "00:00:00";
      } else if (item.entradaOUsaida === "Saída") {
        agrupado[key].saida = item.hora || "00:00:00";
      } else if (item.entradaOUsaida === "Refeição") {
        agrupado[key].refeicao = item.hora || "Sim";
      }
    });

    return Object.values(agrupado);
  }

  const getFeed = (matriculasStr) => {
    if (!matriculasStr || matriculasStr.trim() === "") {
      setFeed([]);
      return;
    }

    setLoadingFeed(true);
    fetch(`https://viaclasse.net/api/ultimos_registros_alunos.php?matriculas=${matriculasStr}`)
      .then((response) => response.json())
      .then((json) => {
        const arr = [];
        Object.entries(json).forEach(([data, alunos]) => {
          Object.entries(alunos).forEach(([matricula, registros]) => {
            registros.forEach((registro) => {
              arr.push({
                ...registro,
                data_hora: registro.data_hora || `${data} 00:00:00`,
                data,
                matricula,
              });
            });
          });
        });
        const feedAgrupado = agruparFeed(arr);
        setFeed(feedAgrupado);
      })
      .catch((error) => {
        console.error("Erro no fetch:", error);
        setFeed([]);
      })
      .finally(() => setLoadingFeed(false));
  };


  useEffect(() => {
    const checkInternetConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    };
    checkInternetConnection();
  }, []);

  useEffect(() => {
    if (!isConnected) {
      Alert.alert("Sem conexão com a internet", "Verifique e tente novamente.");
    }
  }, [isConnected]);

  // 🔹 Buscar matrículas direto da API (sem depender do AsyncStorage antigo)
  const getMatriculasAtualizadas = async (id_user, token, id_escola) => {
    try {
      const url = `https://viaclasse.net/api/listar_matriculas_responsavel.php?id_user=${id_user}&token=${token}&id_escola=${id_escola}`;
      console.log("🔄 Atualizando matrículas via API:", url);

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === "ok" && json.matriculas.length > 0) {
        const novasMatriculas = json.matriculas.join(",");
        setMatriculas(novasMatriculas);
        console.log("✅ Matrículas atualizadas:", novasMatriculas);

        // (opcional) salva no AsyncStorage apenas como cache
        await AsyncStorage.setItem("matriculas_aluno", novasMatriculas);

        // atualiza feed e frequências automaticamente
        getFeed(novasMatriculas);
        getFrequencias(novasMatriculas);
      } else {
        console.log("⚠️ Nenhuma matrícula retornada:", json.mensagem);
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar matrículas:", error);
    }
  };


  const retrieveData = async () => {
    const id_user = await AsyncStorage.getItem("id_user");
    const photo_perfil = await AsyncStorage.getItem("photo");
    const primeiroNome = await AsyncStorage.getItem("primeiroNome");
    const matriculasStr = await AsyncStorage.getItem("matriculas_aluno");
    const token = await AsyncStorage.getItem("token");

    setId_user(id_user || "");
    setPhotoPerfil(photo_perfil || "");
    setPrimeiroNome(primeiroNome || "");
    setMatriculas(matriculasStr || "");

    // 🔹 Agora busca também as frequências
    fetchData(id_user, token);
    getFeed(matriculasStr);
    getFrequencias(matriculasStr);
  };

  // 🔄 Atualização automática das matrículas ao abrir e a cada X minutos
  useEffect(() => {
    let interval;

    const inicializar = async () => {
      const id_user = await AsyncStorage.getItem("id_user");
      const token = await AsyncStorage.getItem("token");
      const id_escola = await AsyncStorage.getItem("id_escola");

      if (!id_user || !token || !id_escola) return;

      // Atualiza matrículas imediatamente ao abrir
      await getMatriculasAtualizadas(id_user, token, id_escola);

      // Atualiza a cada 10 minutos (600.000 ms)
      interval = setInterval(() => {
        getMatriculasAtualizadas(id_user, token, id_escola);
      }, 30 * 1000);
    };

    const unsubscribe = navigation.addListener("focus", () => {
      inicializar();
    });

    // limpa o intervalo ao sair da tela
    return () => {
      if (interval) clearInterval(interval);
      unsubscribe();
    };
  }, [navigation]);



  // Função assíncrona para fazer a consulta à API
  const fetchData = async (id_user, token) => {
    console.log("AQUIII_TOKEN_NOVO: " + token+" USER: "+id_user);
    try {
      const response = await axios.get(
        "https://viaclasse.net/api/verificar_responsavel.php?id_user="+id_user+"&token="+token
      );
      console.log("MENSAGEM:", response.data.msn);
      //setTotalPendente(response.data.total);
    } catch (error) {
      console.error("Erro ao consultar a API Verificar_Responsavel:", error);
    }
  };
  /////////////////////////////////////////////////////////////////////////////////


  function renderFeed(item) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderWidth: 1,
          backgroundColor: "#FFF",
          borderRadius: 10,
          padding: 10,
          borderColor: "#CCC",
          marginBottom: 5,
          marginHorizontal: 5,
        }}
      >
        <View style={{ flex: 2, justifyContent: "center" }}>
          <Text style={{ color: "#008080", fontWeight: "bold" }}>
            {item.nome}
          </Text>
          <Text style={{ color: "#555", fontSize: 12 }}>{item.data}</Text>
        </View>

        {/* Entrada ou Falta */}
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {item.entrada ? (
            <>
              <MaterialCommunityIcons
                name="account-arrow-right"
                size={20}
                color="green"
              />
              <Text style={{ fontSize: 12, color: "green" }}>
                {item.entrada}
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="red"
              />
              <Text style={{ fontSize: 12, color: "red" }}>Falta</Text>
            </>
          )}
        </View>

        {/* Refeição */}
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={20}
            color={item.refeicao ? "blue" : "#AAA"}
          />
        </View>

        {/* Saída */}
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {item.saida ? (
            <>
              <MaterialCommunityIcons
                name="account-arrow-left"
                size={20}
                color="red"
              />
              <Text style={{ fontSize: 12, color: "red" }}>{item.saida}</Text>
            </>
          ) : (
            <Text style={{ fontSize: 12, color: "#AAA" }}>--</Text>
          )}
        </View>
      </View>
    );
  }

  return (
  <ComTela navigation={navigation}>
    <FlatList
      showsVerticalScrollIndicator={false}
      data={feed}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={({ item }) => renderFeed(item)}
      ListHeaderComponent={
        <>
          {/* 🔵 Loading dos cards (frequências) */}
          {loadingCards ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <ActivityIndicator size="large" color="#008080" />
              <Text style={{ color: "#008080", marginTop: 5 }}>
                Carregando frequência...
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ padding: 10 }}
            >
              {frequencias.map((aluno) => (
                <View
                  key={aluno.matricula}
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 10,
                    padding: 15,
                    marginRight: 10,
                    width: 180,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#008080",
                      fontSize: 16,
                    }}
                  >
                    {aluno.nome}
                  </Text>
                  <Image
                    source={
                      aluno.foto &&
                      typeof aluno.foto === "string" &&
                      aluno.foto.trim() !== ""
                        ? { uri: `https://viaclasse.net/${aluno.foto}` }
                        : require("../assets/avatar.jpg")
                    }
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginTop: 5,
                      marginBottom: 5,
                    }}
                  />

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome
                      name="check-circle"
                      size={14}
                      color="green"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{ fontSize: 14, color: "green" }}>
                      Presenças: {aluno.total_presencas_mes}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome
                      name="times-circle"
                      size={14}
                      color="red"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{ fontSize: 14, color: "red" }}>
                      Faltas: {aluno.total_faltas_mes}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      marginTop: 8,
                      paddingVertical: 6,
                      backgroundColor:
                        aluno.em_viagem === 1 ? "#FFD700" : "#008080",
                      borderRadius: 5,
                      alignItems: "center",
                    }}
                    onPress={() =>
                      navigation.navigate("RotaOnibus", {
                        onibus_escolar: aluno.onibus_escolar,
                      })
                    }
                  >
                    <Text
                      style={{
                        color: aluno.em_viagem === 1 ? "#000" : "#FFF",
                        fontSize: 14,
                      }}
                    >
                      {aluno.em_viagem === 1 ? (
                        <>
                          <FontAwesome6 name="bus" size={14} color="#000" /> Em
                          viagem
                        </>
                      ) : (
                        <>
                          <FontAwesome6 name="bus" size={14} color="#FFF" /> Ver
                          Ônibus
                        </>
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={{ fontSize: 20, margin: 10 }}>Últimos registros</Text>

          {/* 🟢 Loading da lista (feed) */}
          {loadingFeed && (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <ActivityIndicator size="large" color="green" />
              <Text style={{ color: "green", marginTop: 5 }}>
                Carregando registros...
              </Text>
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#999"
          />
          <Text
            style={{
              fontSize: 16,
              color: "#777",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Nenhum registro encontrado
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 80 }}
    />

    {/* Botão flutuante fixo */}
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        backgroundColor: "#25D366",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
      }}
      onPress={() => navigation.navigate("CanaisWhatsapp")}
    >
      <FontAwesome name="whatsapp" size={28} color="#fff" />
    </TouchableOpacity>
  </ComTela>
);


}

function TelaNotificacoes({ navigation }) {
  return (
    <ComTela navigation={navigation}>
      <Notificacoes navigation={navigation} />
    </ComTela>
  );
}

function TelaSolicitacoesDocs({ navigation }) {
  return (
    <ComTela navigation={navigation}>
      <SolicitacoesDocs navigation={navigation} />
    </ComTela>
  );
}

function TelaEditarPerfil({ navigation }) {
  return (
    <ComTela navigation={navigation}>
      <EditarPerfil navigation={navigation} />
    </ComTela>
  );
}

function TelaFrequencia({ navigation }) {
  return (
    <ComTela navigation={navigation}>
      <Frequencia navigation={navigation} />
    </ComTela>
  );
}

function TelaCanaisWhatsapp({ navigation }) {
  return (
    <ComTela navigation={navigation}>
      <CanaisWhatsapp navigation={navigation} />
    </ComTela>
  );
}

export default function Home({ navigation }) {
 
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    console.log("🔹 Dados da notificação recebida:", data);

    if (data?.tipo === "documento") {
      navigation.navigate("SolicitacoesDocs");
    } else {
      navigation.navigate("Notificacoes");
    }
  });

  return () => {
    subscription.remove();
  };
}, []);



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

  return (
    <Drawer.Navigator
      initialRouteName="Início"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#008080",
        drawerLabelStyle: { fontSize: 16 },
      }}
      drawerContent={(props) => (
        <ScrollView>
          {/* Cabeçalho com a logo */}
          <View style={{ alignItems: "center", padding: 20 }}>
            <Image
              source={require("../assets/logo3.png")}
              style={styles.logoEmpresaMenu}
            />
          </View>

          {/* Itens do Drawer */}
          <DrawerItemList {...props} />
        </ScrollView>
      )}
    >
      <Drawer.Screen
        name="Início"
        component={TelaInicial}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notificações"
        component={TelaNotificacoes}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-ring-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="SolicitacoesDocs"
        component={TelaSolicitacoesDocs}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />
          ),
          drawerLabel: "Documentos",
        }}
      />

      <Drawer.Screen
        name="Frequência"
        component={TelaFrequencia}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Editar Perfil"
        component={TelaEditarPerfil}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-edit" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Canais WhatsApp"
        component={TelaCanaisWhatsapp}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="whatsapp" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Sair"
        component={sair}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="exit-to-app" color={color} size={size} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}


const styles = StyleSheet.create({
  topoUser: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#008080",
    paddingTop: 30,
    paddingHorizontal: 15,
    height: 90,
  },
  userText: {
    color: "#FFF",
    fontSize: 18,
    marginLeft: 10,
  },
  logoEmpresa: {
    width: 120,
    height: 50,
    resizeMode: "contain",
  },
  logoEmpresaMenu: {
    width: 200,
    height: 50,
    resizeMode: "contain",
  },
});
