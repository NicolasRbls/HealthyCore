"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users,
  Dumbbell,
  Calendar,
  BookOpen,
  Coffee,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import userService from "@/services/userService";
import { UserCount } from "@/types/user";

// Composant pour le graphique d'activité
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Données fictives pour les graphiques
const activityData = [
  { name: "Jan", users: 400, sessions: 240 },
  { name: "Fév", users: 300, sessions: 220 },
  { name: "Mar", users: 500, sessions: 340 },
  { name: "Avr", users: 280, sessions: 380 },
  { name: "Mai", users: 590, sessions: 430 },
  { name: "Juin", users: 490, sessions: 410 },
  { name: "Juil", users: 600, sessions: 480 },
];

const pieData = [
  { name: "Débutant", value: 45 },
  { name: "Intermédiaire", value: 30 },
  { name: "Avancé", value: 25 },
];

const COLORS = ["#92A3FD", "#C58BF2", "#4CAF50", "#FFC107"];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    exerciseCount: 240,
    sessionCount: 85,
    programCount: 32,
    foodCount: 425,
  });

  useEffect(() => {
    // Fonction pour charger les données du tableau de bord
    const loadDashboardData = async () => {
      try {
        // Charger le nombre d'utilisateurs
        const userCountResponse = await userService.getUserCount();

        // Mettre à jour les statistiques avec les données réelles
        setStats((prevStats) => ({
          ...prevStats,
          userCount: userCountResponse.data.totalCount,
        }));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données du tableau de bord:",
          error
        );
      }
    };

    loadDashboardData();
  }, []);

  return (
    <>
      <Header
        title="Tableau de bord"
        subtitle="Bienvenue dans l'administration de HealthyCore"
      />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Vue d'ensemble"
          description="Statistiques et activités de la plateforme"
        />

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Utilisateurs"
            value={stats.userCount}
            icon={<Users size={20} className="text-white" />}
          />
          <StatCard
            title="Exercices"
            value={stats.exerciseCount}
            icon={<Dumbbell size={20} className="text-white" />}
          />
          <StatCard
            title="Séances"
            value={stats.sessionCount}
            icon={<Calendar size={20} className="text-white" />}
          />
          <StatCard
            title="Programmes"
            value={stats.programCount}
            icon={<BookOpen size={20} className="text-white" />}
          />
          <StatCard
            title="Aliments"
            value={stats.foodCount}
            icon={<Coffee size={20} className="text-white" />}
          />
        </div>
      </div>
    </>
  );
}
