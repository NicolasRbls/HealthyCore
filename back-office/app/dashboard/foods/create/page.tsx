"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Coffee, AlertTriangle } from "lucide-react";
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
import { Tag } from "@/types/tag";

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
  .refine(
    (data) => {
      // Si le type est "produit", le code-barres est requis
      if (data.type === "produit") {
        return !!data.barcode;
      }
      // Sinon, le code-barres est facultatif
      return true;
    },
    {
      message: "Le code-barres est requis pour les produits",
      path: ["barcode"], // Indique le champ concerné par l'erreur
    }
  );

type FoodFormValues = z.infer<typeof foodFormSchema>;

export default function CreateFoodPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire pour créer un aliment
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: "",
      type: "produit",
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

  // Observer le type d'aliment pour ajuster les champs requis
  const foodType = form.watch("type");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "aliment");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const onSubmit = async (data: FoodFormValues) => {
    setIsSubmitting(true);
    try {
      // Assurez-vous que les données sont correctement formatées
      const response = await foodService.createFood({
        name: data.name,
        type: data.type,
        image: data.image || "",
        calories: Number(data.calories),
        proteins: Number(data.proteins),
        carbs: Number(data.carbs),
        fats: Number(data.fats),
        preparationTime: data.preparationTime
          ? Number(data.preparationTime)
          : 0,
        ingredients: data.ingredients || "",
        description: data.description || "",
        barcode: data.barcode || "",
        tagIds: data.tagIds,
        userId: 1,
      });

      toast({
        title: "Aliment créé",
        description: "L'aliment a été créé avec succès",
      });

      router.push("/dashboard/foods");
    } catch (error) {
      console.error("Erreur lors de la création de l'aliment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'aliment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Créer un aliment" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/foods")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex : Poulet grillé" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="produit">Produit</SelectItem>
                            <SelectItem value="recette">Recette</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        URL vers une image représentant l'aliment (facultatif)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {foodType === "produit" && (
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code-barres</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex : 3760006473201" {...field} />
                        </FormControl>
                        <FormDescription>
                          Code-barres du produit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {foodType === "recette" && (
                  <>
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingrédients</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Liste des ingrédients"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
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
                onClick={() => router.push("/dashboard/foods")}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="brand-gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création en cours..." : "Créer l'aliment"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
