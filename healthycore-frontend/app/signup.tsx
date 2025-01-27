import { Gender, SignupData } from "../src/types/auth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../src/styles/auth";

export default function Signup() {
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    gender: Gender.NON_SPECIFIE,
    acceptTerms: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSignup = async () => {
    try {
      console.log(formData);
      // Appel API signup
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Masque le DateTimePicker
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // Formate la date en AAAA-MM-JJ
      setFormData({ ...formData, birthDate: formattedDate });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bienvenue,</Text>
      <Text style={styles.subtitle}>Créez votre compte</Text>

      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

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

      {/* Champ pour afficher la date de naissance */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)} // Affiche le DateTimePicker
        style={styles.input}
      >
        <Text style={{ color: formData.birthDate ? "#000" : "#aaa" }}>
          {formData.birthDate || "Date de naissance (AAAA-MM-JJ)"}
        </Text>
      </TouchableOpacity>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // Empêche de sélectionner une date future
        />
      )}

      <View style={styles.genderContainer}>
        {Object.values(Gender).map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderButton,
              formData.gender === gender && styles.genderButtonSelected,
            ]}
            onPress={() => setFormData({ ...formData, gender })}
          >
            <Text
              style={[
                styles.genderButtonText,
                formData.gender === gender && styles.genderButtonTextSelected,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() =>
          setFormData({ ...formData, acceptTerms: !formData.acceptTerms })
        }
      >
        <View
          style={[styles.checkboxBox, formData.acceptTerms && styles.checked]}
        />
        <Text style={styles.checkboxText}>
          En continuant, vous acceptez notre Politique de Confidentialité
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !formData.acceptTerms && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={!formData.acceptTerms}
      >
        <Text style={styles.buttonText}>S'inscrire</Text>
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

      <Link href="/login" style={styles.loginLink}>
        <Text>
          Vous avez un compte ?{" "}
          <Text style={styles.linkText}>Connectez-vous</Text>
        </Text>
      </Link>
    </ScrollView>
  );
}
