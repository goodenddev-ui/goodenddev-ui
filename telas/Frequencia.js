import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const Frequencia = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);
  const [matriculas, setMatriculas] = useState("");

  const formatDate = (date) => date.toISOString().split("T")[0];

  // Função para buscar feed filtrado
  const getFeed = (matricula, inicio = "", fim = "") => {
    const m = matricula || matriculas;
    if (!m) return;

    setIsLoading(true);
    let url = `https://viaclasse.net/api/ultimos_registros_individual.php?matriculas=${m}`;
    if (inicio && fim) url += `&data_inicio=${inicio}&data_fim=${fim}`;

    // 🔹 Log da URL final para debug
    console.log("🔹 URL de requisição:", url);

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        console.log("🔹 JSON retornado:", JSON.stringify(json, null, 2));

        const arr = [];

        // Percorre datas
        Object.entries(json).forEach(([data, alunos]) => {
          // Percorre alunos
          Object.entries(alunos).forEach(([matricula, registros]) => {
            // Cria base agrupada por dia/aluno
            const itemBase = {
              id: `${matricula}-${data}`,
              nome: registros[0]?.nome || "",
              matricula,
              data,
              entrada: "",
              saida: "",
              refeicao: false,
            };

            registros.forEach((registro) => {
              switch (registro.entradaOUsaida) {
                case "Entrada":
                  itemBase.entrada = registro.hora;
                  break;
                case "Saída":
                  itemBase.saida = registro.hora;
                  break;
                case "Refeição":
                  itemBase.refeicao = true;
                  break;
                case "Falta":
                  // Mantém entrada vazia para renderizar "Falta"
                  break;
              }
            });

            arr.push(itemBase);
          });
        });

        console.log("Feed agrupado para FlatList:", arr);
        setFeed(arr);
      })
      .catch(() => setFeed([]))
      .finally(() => setIsLoading(false));
  };

  // Buscar lista de alunos
  const carregarAlunos = (matriculasStr) => {
    fetch(
      `https://viaclasse.net/api/frequencias.php?matriculas=${matriculasStr}`
    )
      .then((res) => res.json())
      .then((json) => {
        setAlunos(json); // json já é lista de alunos
      })
      .catch(() => setAlunos([]));
  };

  useEffect(() => {
    const loadData = async () => {
      const m = await AsyncStorage.getItem("matriculas_aluno");
      setMatriculas(m || "");
      carregarAlunos(m || "");
      getFeed(m || "");
    };
    loadData();
  }, []);

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
    <View style={{ flex: 1 }}>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderFeed(item)}
        ListHeaderComponent={
          <View
            style={{
              padding: 10,
              backgroundColor: "#FFF",
              margin: 10,
              borderRadius: 10,
            }}
          >
            {/* Select de alunos */}
            <Picker
              selectedValue={selectedAluno}
              onValueChange={(value) => setSelectedAluno(value)}
            >
              <Picker.Item label="Selecione o aluno" value="" />
              {alunos.map((aluno) => (
                <Picker.Item
                  key={aluno.matricula}
                  label={aluno.nome}
                  value={aluno.matricula}
                />
              ))}
            </Picker>

            {/* Datepickers */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#EEE",
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 5,
                }}
                onPress={() => setShowInicio(true)}
              >
                <Text>Início: {formatDate(dataInicio)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#EEE",
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginLeft: 5,
                }}
                onPress={() => setShowFim(true)}
              >
                <Text>Fim: {formatDate(dataFim)}</Text>
              </TouchableOpacity>
            </View>

            {showInicio && (
              <DateTimePicker
                value={dataInicio}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowInicio(false);
                  if (date) setDataInicio(date);
                }}
              />
            )}

            {showFim && (
              <DateTimePicker
                value={dataFim}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowFim(false);
                  if (date) setDataFim(date);
                }}
              />
            )}

            {/* Botão Filtrar */}
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: "#008080",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={() =>
                getFeed(
                  selectedAluno,
                  formatDate(dataInicio),
                  formatDate(dataFim)
                )
              }
            >
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>Filtrar</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color="green"
              style={{ marginTop: 50 }}
            />
          ) : (
            <Text style={{ textAlign: "center", marginTop: 50 }}>
              Nenhum registro
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  labelTitle: {
    width: "100%",
    color: "#05072d",
    fontSize: 16,
    paddingStart: 45,
    marginTop: 10,
    fontWeight: "600",
    textAlign: "left",
  },
  folhasContainer: {
    marginTop: 20,
    marginBottom: 92,
    backgroundColor: "#FFF",
    paddingHorizontal: 0,
  },
  folhasRowStyle: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  folhasText: {
    color: "#05072d",
    fontSize: 18,
    flex: 1,
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default Frequencia;
