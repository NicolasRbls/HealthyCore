"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Weight,
  Ruler,
  Activity,
  Award,
  Utensils,
  UserCircle,
  Mail,
  Cake,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import userService from "@/services/userService";
import { UserDetail } from "@/types/user";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUserById(userId);
      setUser({
        ...response.data.user,
        evolution: response.data.evolution,
        nutritionSummary: response.data.nutritionSummary,
        exerciseSummary: response.data.exerciseSummary,
        badgeCount: response.data.badgeCount,
      });
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails de l'utilisateur:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await userService.deleteUser(userId, confirmPassword);
      setDeleteDialogOpen(false);
      setConfirmPassword("");
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Détails de l'utilisateur" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement des détails de l'utilisateur...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header title="Détails de l'utilisateur" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">Utilisateur non trouvé.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/dashboard/users")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`${user.prenom} ${user.nom}`} />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>

          <Button variant="destructive" onClick={handleDeleteClick}>
            Supprimer l'utilisateur
          </Button>
        </div>

        {/* Informations de base */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">
                    Nom complet :
                  </span>
                  <span className="font-medium">
                    {user.prenom} {user.nom}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">Email :</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {user.sexe === "H"
                      ? "Homme"
                      : user.sexe === "F"
                      ? "Femme"
                      : "Non spécifié"}
                  </Badge>
                  <span className="text-sm text-gray-500 w-32">Genre:</span>
                  <span className="font-medium">
                    {user.sexe === "H"
                      ? "Homme"
                      : user.sexe === "F"
                      ? "Femme"
                      : "Non spécifié"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Cake className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">
                    Date de naissance :
                  </span>
                  <span className="font-medium">
                    {format(new Date(user.date_de_naissance), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">
                    Inscrit le:
                  </span>
                  <span className="font-medium">
                    {format(new Date(user.cree_a), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">Rôle :</span>
                  <Badge
                    variant={user.role === "admin" ? "destructive" : "default"}
                  >
                    {user.role === "admin" ? "Admin" : "Utilisateur"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progression et statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Évolution */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution physique</CardTitle>
            </CardHeader>
            <CardContent>
              {user.evolution ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Weight className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Poids actuel:
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.evolution.currentWeight} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Taille :</span>
                    </div>
                    <span className="font-medium">
                      {user.evolution.currentHeight} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">IMC :</span>
                    </div>
                    <span className="font-medium">
                      {user.evolution.currentBMI}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Weight className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Poids initial :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.evolution.startWeight} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Variation de poids :
                      </span>
                    </div>
                    <Badge
                      variant={
                        user.evolution.weightChange < 0
                          ? "destructive"
                          : "default"
                      }
                      className={
                        user.evolution.weightChange < 0 ? "bg-green-500" : ""
                      }
                    >
                      {user.evolution.weightChange > 0 ? "+" : ""}
                      {user.evolution.weightChange} kg
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Durée d'utilisation :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.evolution.timeOnPlatform}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Pas de données d'évolution disponibles.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Suivi nutritionnel */}
          <Card>
            <CardHeader>
              <CardTitle>Suivi nutritionnel</CardTitle>
            </CardHeader>
            <CardContent>
              {user.nutritionSummary ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Objectif calorique :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.nutritionSummary.caloriesGoal} kcal/jour
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Régime alimentaire :
                      </span>
                    </div>
                    <Badge variant="outline">
                      {user.nutritionSummary.diet}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        Répartition des macronutriments :
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Glucides</div>
                        <div className="font-medium">
                          {user.nutritionSummary.macroDistribution.carbs} %
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Protéines</div>
                        <div className="font-medium">
                          {user.nutritionSummary.macroDistribution.protein} %
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Lipides</div>
                        <div className="font-medium">
                          {user.nutritionSummary.macroDistribution.fat} %
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Entrées enregistrées :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.nutritionSummary.entriesCount}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Pas de données nutritionnelles disponibles.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suivi sportif et badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suivi sportif */}
          <Card>
            <CardHeader>
              <CardTitle>Suivi sportif</CardTitle>
            </CardHeader>
            <CardContent>
              {user.exerciseSummary ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Objectif hebdomadaire :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.exerciseSummary.weeklyGoal} séances
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Séances réalisées :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.exerciseSummary.completedSessions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Activité favorite :
                      </span>
                    </div>
                    <Badge variant="outline">
                      {user.exerciseSummary.favoriteActivity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Dernière séance :
                      </span>
                    </div>
                    <span className="font-medium">
                      {format(
                        new Date(user.exerciseSummary.lastSessionDate),
                        "dd MMM yyyy",
                        { locale: fr }
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Pas de données sportives disponibles.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges et récompenses</CardTitle>
            </CardHeader>
            <CardContent>
              {user.badgeCount ? (
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {user.badgeCount} badge{user.badgeCount > 1 ? "s" : ""}{" "}
                    obtenu{user.badgeCount > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Cet utilisateur a obtenu {user.badgeCount} badge
                    {user.badgeCount > 1 ? "s" : ""} en réalisant ses objectifs
                    et en utilisant régulièrement l'application.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic text-center p-6">
                  Cet utilisateur n'a pas encore obtenu de badges.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à{" "}
              {user.prenom} {user.nom}
              seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Entrez votre mot de passe administrateur pour confirmer
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Mot de passe"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}
              disabled={!confirmPassword}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
