// ia_service.js
import axios from "axios";

const MODEL_URL = "http://localhost:11434/api/generate"; // URL où tourne le modèle

export async function askSportBot(question) {
  const prompt = `Q: ${question} A:`;
  let result = "";

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3:mini",
        prompt: prompt,
        stream: true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      // Chaque ligne = un JSON
      chunk.trim().split("\n").forEach(line => {
        try {
          const json = JSON.parse(line);
          if (json.response) result += json.response;
        } catch {}
      });
    }

    return result;
  } catch (err) {
    console.error("Erreur IA :", err);
    return "Désolé, je n'ai pas pu répondreeee.";
  }
}
