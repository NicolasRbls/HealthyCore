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
import { Colors } from "@/lib/constants";

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
      setFood(response.data.food);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails de l'aliment:",
        error
      );
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
      router.push("/dashboard/foods");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'aliment:", error);
    }
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

  return (
    <>
      <Header title={food.nom} />

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

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">{food.nom}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge
                        variant={
                          food.type === "recette" ? "secondary" : "outline"
                        }
                      >
                        {food.type === "recette" ? "Recette" : "Produit"}
                      </Badge>

                      {food.tags &&
                        food.tags.map((tag) => (
                          <Badge key={tag.id_tag} variant="outline">
                            {tag.nom}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    {food.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700">
                          {food.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {food.type === "recette" &&
                        food.preparationTime &&
                        food.preparationTime > 0 && (
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">
                              Temps de préparation:
                            </span>
                            <span className="font-medium">
                              {food.preparationTime} min
                            </span>
                          </div>
                        )}

                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-500 w-32">
                          Source:
                        </span>
                        <Badge
                          variant={
                            food.source === "admin"
                              ? "default"
                              : food.source === "user"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {food.source === "admin"
                            ? "Admin"
                            : food.source === "user"
                            ? "Utilisateur"
                            : "API"}
                        </Badge>
                      </div>

                      {food.creator && (
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500 w-32">
                            Créé par:
                          </span>
                          <span className="font-medium">
                            {food.creator.name}
                          </span>
                        </div>
                      )}

                      {food.barcode && (
                        <div className="flex items-center">
                          <Hash className="h-5 w-5 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500 w-32">
                            Code-barres:
                          </span>
                          <span className="font-medium">{food.barcode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {food.ingredients && (
                    <div className="pt-4 border-t mt-4">
                      <h3 className="text-md font-semibold mb-2">
                        Ingrédients
                      </h3>
                      <p className="text-sm">{food.ingredients}</p>
                    </div>
                  )}

                  {food.usageStats && (
                    <div className="pt-4 border-t mt-4">
                      <h3 className="text-md font-semibold mb-3">
                        Utilisation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Utensils className="h-5 w-5 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500 w-32">
                            Suivis nutritionnels:
                          </span>
                          <span className="font-medium">
                            {food.usageStats.nutritionalFollowUps}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div className="flex space-x-1 items-center">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 text-sm font-medium">
                              {food.usageStats.ratings.positive}
                            </span>
                          </div>
                          <span className="mx-2 text-gray-400">|</span>
                          <div className="flex space-x-1 items-center">
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                            <span className="text-red-500 text-sm font-medium">
                              {food.usageStats.ratings.negative}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.nom}
                      className="max-w-full h-auto max-h-[200px] object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                      <Coffee className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valeurs nutritionnelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calories</span>
                      <span className="font-semibold">
                        {food.calories} kcal
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Protéines</span>
                        <span>{food.proteins} g</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Glucides</span>
                        <span>{food.carbs} g</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lipides</span>
                        <span>{food.fats} g</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-[#92A3FD] to-[#9DCEFF] h-2.5 rounded-full"
                          style={{
                            width: `${
                              (food.proteins /
                                (food.proteins + food.carbs + food.fats)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Protéines</span>
                        <span>
                          {Math.round(
                            (food.proteins /
                              (food.proteins + food.carbs + food.fats)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-[#C58BF2] to-[#EEA4CE] h-2.5 rounded-full"
                          style={{
                            width: `${
                              (food.carbs /
                                (food.proteins + food.carbs + food.fats)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Glucides</span>
                        <span>
                          {Math.round(
                            (food.carbs /
                              (food.proteins + food.carbs + food.fats)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gray-500 h-2.5 rounded-full"
                          style={{
                            width: `${
                              (food.fats /
                                (food.proteins + food.carbs + food.fats)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Lipides</span>
                        <span>
                          {Math.round(
                            (food.fats /
                              (food.proteins + food.carbs + food.fats)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
