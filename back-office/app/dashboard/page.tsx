"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/ui/page-header";
import { Users, Dumbbell, Calendar, BookOpen, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import userService from "@/services/userService";
import programService from "@/services/programService";
import sessionService from "@/services/sessionService";
import exerciseService from "@/services/exerciseService";
import foodService from "@/services/foodService";

// Composant amélioré pour les cartes de statistiques avec état de chargement
const StatCard = ({
  title,
  value,
  icon,
  isLoading = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <h4 className="text-2xl font-bold">
                {value.toLocaleString("fr-FR")}
              </h4>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    exerciseCount: 0,
    sessionCount: 0,
    programCount: 0,
    foodCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    // Fonction pour charger les données du tableau de bord
    const loadDashboardData = async () => {
      try {
        // Chargement parallèle de toutes les statistiques
        const [
          userCountResponse,
          programsResponse,
          sessionsResponse,
          exercisesResponse,
          foodsResponse,
        ] = await Promise.all([
          userService.getUserCount(),
          programService.getPrograms(1, 1), // Juste pour obtenir le total
          sessionService.getSessions(1, 1), // Juste pour obtenir le total
          exerciseService.getExercises(1, 1), // Juste pour obtenir le total
          foodService.getFoods(1, 1), // Juste pour obtenir le total
        ]);

        // Mettre à jour les statistiques avec les données réelles
        setStats({
          userCount: userCountResponse.data.totalCount || 0,
          programCount: programsResponse.data.pagination?.total || 0,
          sessionCount: sessionsResponse.data.pagination?.total || 0,
          exerciseCount: exercisesResponse.data.pagination?.total || 0,
          foodCount: foodsResponse.data.pagination?.total || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données du tableau de bord:",
          error
        );
        setStats((prev) => ({ ...prev, isLoading: false }));
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
          description="Statistiques globales de la plateforme"
        />

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Utilisateurs"
            value={stats.userCount}
            isLoading={stats.isLoading}
            icon={<Users size={20} className="text-white" />}
          />
          <StatCard
            title="Exercices"
            value={stats.exerciseCount}
            isLoading={stats.isLoading}
            icon={<Dumbbell size={20} className="text-white" />}
          />
          <StatCard
            title="Séances"
            value={stats.sessionCount}
            isLoading={stats.isLoading}
            icon={<Calendar size={20} className="text-white" />}
          />
          <StatCard
            title="Programmes"
            value={stats.programCount}
            isLoading={stats.isLoading}
            icon={<BookOpen size={20} className="text-white" />}
          />
          <StatCard
            title="Aliments"
            value={stats.foodCount}
            isLoading={stats.isLoading}
            icon={<Coffee size={20} className="text-white" />}
          />
        </div>
      </div>
    </>
  );
}
