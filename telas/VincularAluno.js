import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { TextInputMask } from "react-native-masked-text";

export default function VincularAluno({ route, navigation }) {
  const { id_pr } = route.params || {};
  const [responsavel, setResponsavel] = useState(null);
  const [alunosVinculados, setAlunosVinculados] = useState([]);
  const [cpfAluno, setCpfAluno] = useState("");
  const [alunoEncontrado, setAlunoEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Buscar dados do responsável ao abrir a tela
  useEffect(() => {
    if (!id_pr) return;
    carregarResponsavel();
  }, [id_pr]);

  const carregarResponsavel = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://viaclasse.net/admin/vincular_aluno.php?id_pr=${id_pr}`
      );
      const html = await response.text();

      // Extração simples de dados HTML do PHP
      const nomeMatch = html.match(/Responsável:<\/strong>\s*(.*?)<br>/);
      const cpfMatch = html.match(/CPF:<\/strong>\s*(.*?)<br>/);
      const alunosMatch = [...html.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1]);

      setResponsavel({
        nome_pr: nomeMatch ? nomeMatch[1] : "—",
        cpf_pr: cpfMatch ? cpfMatch[1] : "—",
      });
      setAlunosVinculados(alunosMatch);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados do responsável.");
    } finally {
      setLoading(false);
    }
  };

  // Buscar aluno por CPF
  const buscarAluno = async () => {
    if (!cpfAluno.trim()) {
      Alert.alert("Atenção", "Digite o CPF do aluno.");
      return;
    }

    setAlunoEncontrado(null);
    setLoading(true);

    try {
      const response = await fetch("https://viaclasse.net/admin/buscar_aluno.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `cpf=${encodeURIComponent(cpfAluno)}&id_pr=${id_pr}`,
      });

      const data = await response.json();

      if (data.success && data.aluno) {
        setAlunoEncontrado(data.aluno);
      } else {
        Alert.alert("Atenção", data.message || "Nenhum aluno com esse CPF foi localizado.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na busca do aluno.");
    } finally {
      setLoading(false);
    }
  };


  // Vincular aluno ao responsável
  const vincularAluno = async (matricula) => {
    try {
      setLoading(true);
      const response = await fetch("https://viaclasse.net/admin/vincular_aluno_acao.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_pr=${id_pr}&matricula=${encodeURIComponent(
          matricula
        )}&acao=adicionar`,
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert("Sucesso", data.message, [
          { text: "OK", onPress: carregarResponsavel },
        ]);
        setAlunoEncontrado(null);
        setCpfAluno("");
      } else {
        Alert.alert("Aviso", data.message);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao vincular aluno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>


        {loading && <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 20 }} />}

        {responsavel && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Responsável:</Text> {responsavel.nome_pr}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>CPF:</Text> {responsavel.cpf_pr}
            </Text>
            <Text style={[styles.bold, { marginTop: 10 }]}>Alunos vinculados:</Text>
            {alunosVinculados.length > 0 ? (
              alunosVinculados.map((a, i) => (
                <Text key={i} style={styles.item}>
                  • {a}
                </Text>
              ))
            ) : (
              <Text style={styles.muted}>Nenhum aluno vinculado</Text>
            )}
          </View>
        )}

        {/* Campo de CPF do aluno */}
        <View style={styles.searchBox}>
          <TextInputMask
            type={"cpf"}
            placeholder="Digite o CPF do aluno"
            style={styles.input}
            value={cpfAluno}
            onChangeText={setCpfAluno}
          />
          <TouchableOpacity style={styles.btnBuscar} onPress={buscarAluno}>
            <Ionicons name="search" size={22} color="#fff" />
            <Text style={styles.btnText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Resultado da busca */}
        {alunoEncontrado && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              <MaterialIcons name="person" size={18} color="#198754" />{" "}
              {alunoEncontrado.nome_completo}
            </Text>
            <Text style={styles.resultText}>
              Matrícula: {alunoEncontrado.matricula}
            </Text>
            <Text style={styles.resultText}>Turma: {alunoEncontrado.turma}</Text>

            <TouchableOpacity
              style={styles.btnVincular}
              onPress={() => vincularAluno(alunoEncontrado.matricula)}
            >
              <MaterialIcons name="add-circle" size={20} color="#fff" />
              <Text style={styles.btnText}>Vincular</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnVoltar, { marginTop: 30 }]}
          onPress={() => navigation.navigate("ListaResponsaveis")}
        >
          <MaterialIcons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.btnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f8f9fa" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    elevation: 4,
  },
  header: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 10,
    borderRadius: 8,
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#e9ecef",
    borderLeftWidth: 4,
    borderLeftColor: "#0d6efd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  infoText: { color: "#333" },
  bold: { fontWeight: "bold" },
  muted: { color: "#777", marginTop: 4 },
  item: { color: "#444", marginLeft: 6 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f1f3f4",
  },
  btnBuscar: {
    flexDirection: "row",
    backgroundColor: "#0d6efd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  resultCard: {
    borderWidth: 1,
    borderColor: "#198754",
    borderRadius: 8,
    backgroundColor: "#f8fff9",
    padding: 10,
    marginTop: 10,
  },
  resultTitle: { fontSize: 15, fontWeight: "600", color: "#198754" },
  resultText: { fontSize: 14, color: "#333" },
  btnVincular: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#198754",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    justifyContent: "center",
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
  },
});
