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
  Heart,
  Dumbbell,
  Info,
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
import { UserDetail, NewUserDetail } from "@/types/user";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<NewUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getUserById(userId);
      setUser(response.data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails de l'utilisateur:",
        error
      );
      setError("Impossible de charger les détails de l'utilisateur.");
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
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  // Fonction pour obtenir le nom du régime alimentaire
  const getDietName = (id) => {
    const diets = {
      1: "Aucun",
      2: "Végétarien",
      3: "Végétalien",
      4: "Sans gluten",
      5: "Sans lactose",
    };
    return diets[id] || "Non spécifié";
  };

  // Fonction pour obtenir le nom du niveau de sédentarité
  const getSedentaryLevelName = (id) => {
    const levels = {
      1: "Très sédentaire",
      2: "Sédentaire",
      3: "Modérément actif",
      4: "Actif",
      5: "Très actif",
    };
    return levels[id] || "Non spécifié";
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

  if (error) {
    return (
      <>
        <Header title="Erreur" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                variant="outline"
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

  // Utiliser des valeurs par défaut si les données sont indéfinies
  const displayName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Utilisateur sans nom";

  return (
    <>
      <Header title={displayName} />

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
            <CardTitle className="flex items-center">
              <UserCircle className="h-5 w-5 mr-2" />
              Informations personnelles
            </CardTitle>
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
                    {user.firstName || "Non spécifié"} {user.lastName || ""}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">Email :</span>
                  <span className="font-medium">
                    {user.email || "Non spécifié"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-36">Genre :</span>
                  <Badge
                    variant="outline"
                    className={`mr-2 ${
                      user.gender === "H"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : user.gender === "F"
                        ? "bg-pink-50 text-pink-600 border-pink-200"
                        : ""
                    }`}
                  >
                    {user.gender === "H"
                      ? "Homme"
                      : user.gender === "F"
                      ? "Femme"
                      : "Non spécifié"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-36">
                    Date de naissance :
                  </span>{" "}
                  <span className="font-medium">
                    {user.birthDate
                      ? format(new Date(user.birthDate), "dd MMMM yyyy", {
                          locale: fr,
                        })
                      : "Non spécifié"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Cake className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-36">Âge :</span>{" "}
                  <span className="font-medium">
                    {user.age > 0 ? `${user.age} ans` : "Non spécifié"}
                  </span>
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
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Informations physiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Weight className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Poids actuel :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.metrics.currentWeight > 0
                        ? `${user.metrics.currentWeight} kg`
                        : "Non défini"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Taille :</span>
                    </div>
                    <span className="font-medium">
                      {user.metrics.currentHeight > 0
                        ? `${user.metrics.currentHeight} cm`
                        : "Non défini"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">IMC :</span>
                    </div>
                    <Badge
                      className={
                        user.metrics.bmi < 18.5
                          ? "bg-blue-100 text-blue-800"
                          : user.metrics.bmi < 25
                          ? "bg-green-100 text-green-800"
                          : user.metrics.bmi < 30
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {user.metrics.bmi > 0 ? user.metrics.bmi : "Non défini"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Weight className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Poids cible :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.metrics.targetWeight > 0
                        ? `${user.metrics.targetWeight} kg`
                        : "Non défini"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Calories quotidiennes :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.metrics.dailyCalories > 0
                        ? `${user.metrics.dailyCalories} kcal`
                        : "Non défini"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Séances par semaine :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.metrics.sessionsPerWeek > 0
                        ? user.metrics.sessionsPerWeek
                        : "Non défini"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Pas de données d'évolution disponibles.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Préférences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.preferences ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Régime alimentaire :
                      </span>
                    </div>
                    <span className="font-medium">
                      {getDietName(user.preferences.id_regime_alimentaire)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Niveau d'activité :
                      </span>
                    </div>
                    <span className="font-medium">
                      {getSedentaryLevelName(
                        user.preferences.id_niveau_sedentarite
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Durée objectif :
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.preferences.duree_objectif_semaines
                        ? `${user.preferences.duree_objectif_semaines} semaines`
                        : "Non défini"}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">BMR :</span>
                    </div>
                    <span className="font-medium">
                      {user.preferences.bmr} kcal
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">TDEE :</span>
                    </div>
                    <span className="font-medium">
                      {user.preferences.tdee} kcal
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Déficit/Surplus :
                      </span>
                    </div>
                    <Badge
                      className={
                        Number(user.preferences.deficit_surplus_calorique) < 0
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {user.preferences.deficit_surplus_calorique} kcal
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Pas de préférences définies.
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
              {user.firstName} {user.lastName}
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
