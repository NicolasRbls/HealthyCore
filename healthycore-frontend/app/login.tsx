import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { styles } from "../src/styles/auth";
import { LoginData } from "../src/types/auth";

export default function Login() {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      console.log(formData);
      // Appel API login
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Salut,</Text>
      <Text style={styles.subtitle}>Bon retour !</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Ou</Text>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Text>G</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text>f</Text>
        </TouchableOpacity>
      </View>

      <Link href="/signup" style={styles.signupLink}>
        <Text>
          Pas de compte ? <Text style={styles.linkText}>Inscrivez-vous</Text>
        </Text>
      </Link>
    </ScrollView>
  );
}
