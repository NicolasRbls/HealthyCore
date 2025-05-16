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
        subtitle="Bienvenue dans l'administration de FitCoach"
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
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Exercices"
            value={stats.exerciseCount}
            icon={<Dumbbell size={20} className="text-white" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Séances"
            value={stats.sessionCount}
            icon={<Calendar size={20} className="text-white" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Programmes"
            value={stats.programCount}
            icon={<BookOpen size={20} className="text-white" />}
            trend={{ value: 2, isPositive: false }}
          />
          <StatCard
            title="Aliments"
            value={stats.foodCount}
            icon={<Coffee size={20} className="text-white" />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Activité des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#92A3FD"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#C58BF2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des utilisateurs par niveau</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => `${value} utilisateurs`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <ArrowUpRight size={14} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Nouveau programme ajouté :{" "}
                    <span className="font-semibold">
                      Programme Full Body 6 semaines
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Users size={14} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    5 nouveaux utilisateurs inscrits
                  </p>
                  <p className="text-xs text-gray-500">Il y a 4 heures</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Coffee size={14} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Nouvelle recette ajoutée :{" "}
                    <span className="font-semibold">
                      Bowl protéiné au saumon
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">Il y a 6 heures</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <ArrowDownRight size={14} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Aliment signalé :{" "}
                    <span className="font-semibold">Pizza aux légumes</span>
                  </p>
                  <p className="text-xs text-gray-500">Il y a 8 heures</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
