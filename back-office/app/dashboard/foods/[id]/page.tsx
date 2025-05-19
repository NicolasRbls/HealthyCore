"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Coffee,
  Utensils,
  User,
  Tag as TagIcon,
  ThumbsUp,
  ThumbsDown,
  Hash,
  Info,
  Carrot,
  Wheat,
  Droplet,
  Flame,
  FileText,
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
import foodService from "@/services/foodService";
import { FoodWithDetails } from "@/types/food";
import { toast } from "@/hooks/use-toast";

export default function FoodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const foodId = Number(params.id);

  const [food, setFood] = useState<FoodWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (foodId) {
      loadFoodDetails();
    }
  }, [foodId]);

  const loadFoodDetails = async () => {
    setIsLoading(true);
    try {
      const response = await foodService.getFoodById(foodId);

      // Transformation des données pour l'affichage
      const foodData = response.data;

      // Nettoyer les champs qui utilisent des séparateurs
      if (foodData.description) {
        foodData.description = foodData.description.split("|").join("\n");
      }

      if (foodData.ingredients) {
        foodData.ingredients = foodData.ingredients.split("|").join("\n");
      }

      // Nettoyer l'URL de l'image (enlever les espaces)
      if (foodData.image) {
        foodData.image = foodData.image.trim();
      }

      setFood(foodData);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails de l'aliment:",
        error
      );
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'aliment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    router.push(`/dashboard/foods/${foodId}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await foodService.deleteFood(foodId);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Succès",
        description: "L'aliment a été supprimé avec succès",
      });
      router.push("/dashboard/foods");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'aliment:", error);
      toast({
        title: "Erreur",
        description:
          "La suppression de l'aliment a échoué. Il est peut-être utilisé dans des suivis nutritionnels.",
        variant: "destructive",
      });
    }
  };

  // Calcul sécurisé des pourcentages nutritionnels
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (isLoading) {
    return (
      <>
        <Header title="Détails de l'aliment" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement des détails de l'aliment...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!food) {
    return (
      <>
        <Header title="Détails de l'aliment" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">Aliment non trouvé.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/dashboard/foods")}
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

  // Calculer les totaux pour les macronutriments
  const totalMacros = food.proteins + food.carbs + food.fats;

  return (
    <>
      <Header title={food.name} />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/foods")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Carte de titre et image */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-auto max-h-[300px] object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-[300px] bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
                      <Coffee className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="w-full md:w-2/3">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant={
                        food.type === "recette" ? "secondary" : "outline"
                      }
                      className="text-sm"
                    >
                      {food.type === "recette" ? "Recette" : "Produit"}
                    </Badge>
                    <Badge
                      variant={
                        food.source === "admin"
                          ? "default"
                          : food.source === "user"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-sm"
                    >
                      {food.source === "admin"
                        ? "Admin"
                        : food.source === "user"
                        ? "Utilisateur"
                        : "API"}
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold mb-3">{food.name}</h1>

                  {food.description && (
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {food.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {food.type === "recette" && food.preparationTime > 0 && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">
                          Temps de préparation: {food.preparationTime} min
                        </span>
                      </div>
                    )}

                    {food.creator && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">
                          Créé par: {food.creator.name}
                        </span>
                      </div>
                    )}

                    {food.barcode && (
                      <div className="flex items-center">
                        <Hash className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">
                          Code-barres: {food.barcode}
                        </span>
                      </div>
                    )}

                    {food.usageStats && (
                      <div className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">
                          Utilisé dans {food.usageStats.nutritionalFollowUps}{" "}
                          suivis
                        </span>
                      </div>
                    )}
                  </div>

                  {food.tags && food.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <TagIcon className="h-5 w-5 text-gray-500 mr-1" />
                      {food.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-sm"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations nutritionnelles et ingrédients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            {food.ingredients && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Ingrédients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">{food.ingredients}</div>
                </CardContent>
              </Card>
            )}

            {food.usageStats && food.usageStats.ratings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-gray-600" />
                    Évaluations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-around py-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-2">
                        <ThumbsUp className="h-6 w-6 text-green-500 mr-2" />
                        <span className="text-xl font-bold">
                          {food.usageStats.ratings.positive}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">J'aime</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-2">
                        <ThumbsDown className="h-6 w-6 text-red-500 mr-2" />
                        <span className="text-xl font-bold">
                          {food.usageStats.ratings.negative}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Je n'aime pas
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="text-xl font-bold mb-2">
                        {food.usageStats.ratings.total}
                      </div>
                      <span className="text-sm text-gray-500">Total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-gray-600" />
                  Valeurs nutritionnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Calories</span>
                    <span className="font-semibold text-lg">
                      {food.calories} kcal
                    </span>
                  </div>
                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Carrot className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Protéines</span>
                      <span className="ml-auto font-medium">
                        {food.proteins} g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                        style={{
                          width: `${calculatePercentage(
                            food.proteins,
                            totalMacros
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wheat className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium">Glucides</span>
                      <span className="ml-auto font-medium">
                        {food.carbs} g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
                        style={{
                          width: `${calculatePercentage(
                            food.carbs,
                            totalMacros
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium">Lipides</span>
                      <span className="ml-auto font-medium">{food.fats} g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full"
                        style={{
                          width: `${calculatePercentage(
                            food.fats,
                            totalMacros
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Répartition</span>
                      <span className="text-sm">100%</span>
                    </div>
                    <div className="w-full h-6 rounded-lg overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        style={{
                          width: `${calculatePercentage(
                            food.proteins,
                            totalMacros
                          )}%`,
                        }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                        style={{
                          width: `${calculatePercentage(
                            food.carbs,
                            totalMacros
                          )}%`,
                        }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                        style={{
                          width: `${calculatePercentage(
                            food.fats,
                            totalMacros
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>
                        P: {calculatePercentage(food.proteins, totalMacros)}%
                      </span>
                      <span>
                        G: {calculatePercentage(food.carbs, totalMacros)}%
                      </span>
                      <span>
                        L: {calculatePercentage(food.fats, totalMacros)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet aliment ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Si cet aliment est utilisé dans des
              suivis nutritionnels, la suppression pourrait être empêchée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
