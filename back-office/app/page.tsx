"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem("token");

    if (token) {
      // Si connecté, rediriger vers le dashboard
      window.location.href = "/dashboard";
    } else {
      // Sinon, rediriger vers la page de login
      window.location.href = "/auth/login";
    }
  }, []);

  return null; // Cette page est juste une redirection, pas de rendu nécessaire
}
