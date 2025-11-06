import { askSportBot } from "./ia.service.js";

/**
 * Fonction pour répondre à une question sur le sport
 */
export const askQuestion = async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question manquante" });

  try {
    // Appel du service IA
    const answer = await askSportBot(question);
    res.json({ answer });
  } catch (err) {
    console.error("Erreur IA:", err);
    res.status(500).json({ error: "Impossible de répondre pour le moment" });
  }
};
