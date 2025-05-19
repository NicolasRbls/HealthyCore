"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Info } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import foodService from "@/services/foodService";
import tagService from "@/services/tagService";
import { FoodWithDetails } from "@/types/food";
import { Tag } from "@/types/tag";
import { Badge } from "@/components/ui/badge";

// Schéma de validation pour le formulaire d'aliment
const foodFormSchema = z
  .object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    type: z.string().min(1, { message: "Le type est requis" }),
    image: z
      .string()
      .url({ message: "URL invalide" })
      .optional()
      .or(z.literal("")),
    calories: z
      .number()
      .min(0, { message: "Les calories ne peuvent pas être négatives" }),
    proteins: z
      .number()
      .min(0, { message: "Les protéines ne peuvent pas être négatives" }),
    carbs: z
      .number()
      .min(0, { message: "Les glucides ne peuvent pas être négatifs" }),
    fats: z
      .number()
      .min(0, { message: "Les lipides ne peuvent pas être négatifs" }),
    preparationTime: z
      .number()
      .min(0, { message: "Le temps de préparation ne peut pas être négatif" })
      .optional(),
    ingredients: z.string().optional(),
    description: z.string().optional(),
    barcode: z.string().optional(),
    tagIds: z
      .array(z.number())
      .min(1, { message: "Sélectionnez au moins un tag" }),
  })
  .refine((data) => {
    // Si le type est "produit", le code-barres est requis (si nécessaire)
    // Mais cela ne s'applique pas en édition puisque le type est déjà fixé
    return true;
  });

type FoodFormValues = z.infer<typeof foodFormSchema>;

export default function EditFoodPage() {
  const router = useRouter();
  const params = useParams();
  const foodId = Number(params.id);
  const { toast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [food, setFood] = useState<FoodWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  // Formulaire pour modifier un aliment
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: "",
      type: "", // Valeur par défaut pour le type
      image: "",
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
      preparationTime: 0,
      ingredients: "",
      description: "",
      barcode: "",
      tagIds: [],
    },
  });

  // Surveiller le champ d'image pour une prévisualisation
  const watchImage = form.watch("image");

  useEffect(() => {
    if (watchImage) {
      setPreviewImage(watchImage);
    }
  }, [watchImage]);

  useEffect(() => {
    loadTags();
    if (foodId) {
      loadFoodDetails();
    }
  }, [foodId]);

  useEffect(() => {
    if (food && tags.length > 0) {
      // Préparer et nettoyer les données pour le formulaire
      const cleanedDescription = food.description?.replace(/\|/g, "\n") || "";
      const cleanedIngredients = food.ingredients?.replace(/\|/g, "\n") || "";

      // Convertir les IDs de tags selon le format retourné par l'API
      const tagIds = food.tags?.map((tag) => tag.id || tag.id_tag) || [];
      form.reset({
        name: food.name,
        type: food.type, // Ajout du champ type
        image: (food.image || "").trim(),
        calories: food.calories,
        proteins: food.proteins,
        carbs: food.carbs,
        fats: food.fats,
        preparationTime: food.preparationTime || 0,
        ingredients: cleanedIngredients,
        description: cleanedDescription,
        barcode: food.barcode || "",
        tagIds: tagIds,
      });

      // Mettre à jour la prévisualisation de l'image
      if (food.image) {
        setPreviewImage(food.image.trim());
      }
    }
  }, [food, tags, form.reset]);

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "aliment");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tags",
        variant: "destructive",
      });
    }
  };

  const loadFoodDetails = async () => {
    setIsLoading(true);
    try {
      const response = await foodService.getFoodById(foodId);
      setFood(response.data);
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

  const onSubmit = async (data: FoodFormValues) => {
    setIsSubmitting(true);
    try {
      // Convertir le format des champs avant l'envoi
      const formattedDescription = data.description?.replace(/\n/g, "|") || "";
      const formattedIngredients = data.ingredients?.replace(/\n/g, "|") || "";
      await foodService.updateFood(foodId, {
        name: data.name,
        type: data.type, // Ajout du champ type
        image: data.image,
        calories: data.calories,
        proteins: data.proteins,
        carbs: data.carbs,
        fats: data.fats,
        preparationTime: data.preparationTime,
        ingredients: formattedIngredients,
        description: formattedDescription,
        barcode: data.barcode,
        tagIds: data.tagIds,
      });

      toast({
        title: "Succès",
        description: "L'aliment a été mis à jour avec succès",
      });

      router.push(`/dashboard/foods/${foodId}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'aliment:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour de l'aliment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Modifier l'aliment" />
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
        <Header title="Modifier l'aliment" />
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
      <Header title={`Modifier : ${food.name}`} />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/foods/${foodId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux détails
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              {" "}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Informations générales
                  <Badge
                    variant={food.type === "recette" ? "secondary" : "outline"}
                  >
                    {food.type === "recette" ? "Recette" : "Produit"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Champ caché pour le type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex : Poulet grillé"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image (URL)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL vers une image représentant l'aliment
                            (facultatif)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {food.type === "produit" && (
                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code-barres</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex : 3760006473201"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Code-barres du produit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {previewImage ? (
                      <div className="w-full max-w-xs">
                        <p className="text-sm font-medium mb-2">
                          Aperçu de l'image :
                        </p>
                        <img
                          src={previewImage}
                          alt="Aperçu"
                          className="w-full h-auto max-h-[200px] object-contain rounded-md border border-gray-200"
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-xs h-[200px] bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                        <p className="text-gray-400">Aucune image</p>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description de l'aliment"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Utilisez les sauts de ligne pour structurer votre
                        description
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {food.type === "recette" && (
                  <>
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingrédients</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste des ingrédients (un par ligne)"
                              {...field}
                              rows={5}
                            />
                          </FormControl>
                          <FormDescription>
                            Écrivez un ingrédient par ligne
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preparationTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temps de préparation (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              value={field.value || 0}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valeurs nutritionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories (kcal)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proteins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protéines (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Glucides (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lipides (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Les valeurs nutritionnelles sont exprimées pour 100g de
                      l'aliment ou pour une portion de la recette.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tagIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Sélectionnez au moins un tag</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {tags.map((tag) => (
                          <FormField
                            key={tag.id_tag}
                            control={form.control}
                            name="tagIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tag.id_tag}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        tag.id_tag
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              tag.id_tag,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tag.id_tag
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer">
                                    {tag.nom}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/foods/${foodId}`)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="brand-gradient"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Mise à jour en cours..."
                  : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
