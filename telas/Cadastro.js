import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaterialIcons } from "@expo/vector-icons";
import { TextInputMask } from "react-native-masked-text";
import { Picker } from "@react-native-picker/picker";

export default function Cadastro({ navigation }) {
  const [form, setForm] = useState({
    nome_pr: "",
    cpf_pr: "",
    telefone_pr: "",
    data_nascimento_pr: "",
    email_pr: "",
    ocupacao: "",
    parentesco_pr: "",
    cep_pr: "",
    cidade_pr: "",
    estado_pr: "",
    endereco_pr: "",
    numero_casa: "", // ➕ novo campo
    senha: "",
    confirmar_senha: "",
  });


  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    if (value.trim() !== "") setErros({ ...erros, [name]: false });
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    return true;
  };

  const buscarCEP = async () => {
    const cep = form.cep_pr.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        Alert.alert("CEP inválido", "Não foi possível localizar o endereço.");
        return;
      }
      setForm({
        ...form,
        endereco_pr: `${data.logradouro || ""}${data.bairro ? " - " + data.bairro : ""}`,
        cidade_pr: data.localidade || "",
        estado_pr: data.uf || "",
      });
    } catch (err) {
      Alert.alert("Erro", "Falha ao consultar o CEP.");
    } finally {
      setLoading(false);
    }
  };

  const validarCampos = () => {
    const obrigatorios = [
      "nome_pr",
      "cpf_pr",
      "telefone_pr",
      "data_nascimento_pr",
      "email_pr",
      "ocupacao",
      "parentesco_pr",
      "cep_pr",
      "cidade_pr",
      "estado_pr",
      "endereco_pr",
      "numero_casa",
      "senha",
      "confirmar_senha",
    ];

    let novosErros = {};
    let ok = true;

    obrigatorios.forEach((campo) => {
      if (!form[campo] || form[campo].trim() === "") {
        novosErros[campo] = true;
        ok = false;
      }
    });

    // verifica se as senhas coincidem
    if (form.senha !== form.confirmar_senha) {
      novosErros.senha = true;
      novosErros.confirmar_senha = true;
      ok = false;
      Alert.alert("Atenção", "As senhas não coincidem.");
    }

    setErros(novosErros);

    if (!ok) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
    }

    return ok;
  };

  const salvarResponsavel = async () => {
    if (!validarCampos()) return;

    if (!validarCPF(form.cpf_pr)) {
      setErros({ ...erros, cpf_pr: true });
      Alert.alert("CPF inválido", "Verifique o CPF informado.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const formConvertido = { ...form };

      // Converter data para formato YYYY-MM-DD
      if (formConvertido.data_nascimento_pr.includes("/")) {
        const [dia, mes, ano] = formConvertido.data_nascimento_pr.split("/");
        formConvertido.data_nascimento_pr = `${ano}-${mes}-${dia}`;
      }

      // 🏠 Concatenar endereço e número antes de enviar
      if (formConvertido.numero_casa && formConvertido.endereco_pr) {
        formConvertido.endereco_pr = `${formConvertido.endereco_pr}, Número ${formConvertido.numero_casa}`;
      }

      Object.entries(formConvertido).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch("https://viaclasse.net/admin/salvar_responsavel.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Sucesso", result.message, [
          {
            text: "OK",
            onPress: () => navigation.navigate("VincularAluno", { id_pr: result.id_pr }),
          },
        ]);
      } else {
        Alert.alert("Erro", result.message || "Falha ao salvar os dados.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, key, mask = null, keyboard = "default", extra = {}) => {
    const isError = erros[key];
    const isValid = form[key]?.trim() !== "" && !isError;
    const borderColor = isError ? "#dc3545" : isValid ? "#198754" : "#ccc";

    return (
      <View style={[styles.inputContainer, { borderColor }]}>
        {mask ? (
          <TextInputMask
            type={mask}
            style={styles.input}
            placeholder={label}
            value={form[key]}
            keyboardType={keyboard}
            onChangeText={(t) => handleChange(key, t)}
            {...extra}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder={label}
            value={form[key]}
            keyboardType={keyboard}
            secureTextEntry={label.toLowerCase().includes("senha")}
            onChangeText={(t) => handleChange(key, t)}
            {...extra}
          />
        )}
        {isError && <MaterialIcons name="cancel" size={20} color="#dc3545" />}
        {isValid && <MaterialIcons name="check-circle" size={20} color="#198754" />}
      </View>
    );
  };

  // Função específica para validar em tempo real as senhas
  const senhasCoincidem = form.senha && form.confirmar_senha && form.senha === form.confirmar_senha;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraHeight={120}
      keyboardOpeningTime={0}
      extraScrollHeight={40}
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
    >
      <View style={styles.card}>
        {renderInput("Nome", "nome_pr")}
        {renderInput("CPF", "cpf_pr", "cpf", "numeric")}
        {renderInput("Telefone", "telefone_pr", "cel-phone", "numeric")}
        {renderInput("Data de Nascimento (DD/MM/AAAA)", "data_nascimento_pr", "datetime", "numeric", {
          options: { format: "DD/MM/YYYY" },
        })}
        {renderInput("Email", "email_pr", null, "email-address")}
        {renderInput("Ocupação", "ocupacao")}

        {/* Parentesco */}
        <View
          style={[
            styles.pickerContainer,
            {
              borderColor: erros.parentesco_pr
                ? "#dc3545"
                : form.parentesco_pr
                ? "#198754"
                : "#ccc",
            },
          ]}
        >
          <Picker
            selectedValue={form.parentesco_pr}
            onValueChange={(v) => handleChange("parentesco_pr", v)}
          >
            <Picker.Item label="Selecione o Parentesco" value="" />
            <Picker.Item label="Pai" value="Pai" />
            <Picker.Item label="Mãe" value="Mãe" />
            <Picker.Item label="Avô" value="Avô" />
            <Picker.Item label="Avó" value="Avó" />
            <Picker.Item label="Tio" value="Tio" />
            <Picker.Item label="Tia" value="Tia" />
            <Picker.Item label="Irmão" value="Irmão" />
            <Picker.Item label="Irmã" value="Irmã" />
            <Picker.Item label="Padrasto" value="Padrasto" />
            <Picker.Item label="Madrasta" value="Madrasta" />
            <Picker.Item label="Responsável Legal" value="Responsável Legal" />
            <Picker.Item label="Outro" value="Outro" />
          </Picker>
        </View>

        {renderInput("CEP", "cep_pr", "zip-code", "numeric", { onBlur: buscarCEP })}
        {renderInput("Cidade", "cidade_pr")}
        {renderInput("Estado", "estado_pr")}
        {renderInput("Endereço completo", "endereco_pr")}
        {renderInput("Número", "numero_casa", null, "numeric")}

        {/* Campos de Senha */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: form.senha && form.confirmar_senha
                ? senhasCoincidem
                  ? "#198754"
                  : "#dc3545"
                : "#ccc",
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={form.senha}
            secureTextEntry
            onChangeText={(t) => handleChange("senha", t)}
          />
          {senhasCoincidem && form.senha ? (
            <MaterialIcons name="check-circle" size={20} color="#198754" />
          ) : form.senha && form.confirmar_senha && !senhasCoincidem ? (
            <MaterialIcons name="cancel" size={20} color="#dc3545" />
          ) : null}
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: form.senha && form.confirmar_senha
                ? senhasCoincidem
                  ? "#198754"
                  : "#dc3545"
                : "#ccc",
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            value={form.confirmar_senha}
            secureTextEntry
            onChangeText={(t) => handleChange("confirmar_senha", t)}
          />
          {senhasCoincidem && form.confirmar_senha ? (
            <MaterialIcons name="check-circle" size={20} color="#198754" />
          ) : form.senha && form.confirmar_senha && !senhasCoincidem ? (
            <MaterialIcons name="cancel" size={20} color="#dc3545" />
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#198754" }]}
              onPress={salvarResponsavel}
            >
              <MaterialIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.btnText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#6c757d" }]}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    marginTop: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f1f3f4",
    marginBottom: 10,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});
