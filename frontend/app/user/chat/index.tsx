import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";

export default function Chat() {
  const [messages, setMessages] = useState<{ id: string; text: string; sender: "user" | "bot" }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://172.20.10.3:5000/api/ia/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });

      const data = await response.json();
      const botMessage = {
        id: Date.now().toString() + "_bot",
        text: data.answer || "Je n'ai pas compris.",
        sender: "bot"
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const botMessage = {
        id: Date.now().toString() + "_error",
        text: "Erreur : Impossible de contacter le serveur.",
        sender: "bot"
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setLoading(false);

    // Scroll auto
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userMessage : styles.botMessage
            ]}
          >
            <Text style={{ color: item.sender === "bot" ? "#fff" : "#000" }}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 10 }} />}

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Écris un message..."
          style={styles.input}
        />
        <Button title="Envoyer" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  message: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    maxWidth: "80%"
  },
  userMessage: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-end"
  },
  botMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-start"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    padding: 5
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 5
  }
});
