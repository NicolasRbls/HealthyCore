"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Dumbbell } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import sessionService from "@/services/sessionService";
import exerciseService from "@/services/exerciseService";
import tagService from "@/services/tagService";
import { Exercise } from "@/types/exercise";
import { Tag } from "@/types/tag";
import { SessionExercise } from "@/types/session";

// Schéma de validation pour le formulaire d'exercice dans la séance
const sessionExerciseSchema = z.object({
  exerciseId: z.number({
    required_error: "Sélectionnez un exercice",
  }),
  order: z.number().min(1),
  repetitions: z.number().min(0).optional(),
  sets: z.number().min(0).optional(),
  duration: z.number().min(0),
});

// Schéma de validation pour le formulaire de séance
const sessionFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }),
  tagIds: z
    .array(z.number())
    .min(1, { message: "Sélectionnez au moins un tag" }),
  exercises: z
    .array(sessionExerciseSchema)
    .min(1, { message: "Ajoutez au moins un exercice" }),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

export default function CreateSessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire pour créer une séance
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      name: "",
      tagIds: [],
      exercises: [],
    },
  });

  // Utilisation de useFieldArray pour gérer la liste d'exercices
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  useEffect(() => {
    loadTags();
    loadExercises();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "sport");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const loadExercises = async () => {
    try {
      const response = await exerciseService.getExercises(1, 100);
      setExercises(response.data.exercises);
    } catch (error) {
      console.error("Erreur lors du chargement des exercices:", error);
    }
  };

  const onSubmit = async (data: SessionFormValues) => {
    setIsSubmitting(true);
    try {
      await sessionService.createSession({
        name: data.name,
        tagIds: data.tagIds,
        exercises: data.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          repetitions: ex.repetitions || 0,
          sets: ex.sets || 0,
          duration: ex.duration,
        })),
      });

      toast({
        title: "Séance créée",
        description: "La séance a été créée avec succès",
      });

      router.push("/sessions");
    } catch (error) {
      console.error("Erreur lors de la création de la séance:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la séance",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExercise = () => {
    append({
      exerciseId: 0,
      order: fields.length + 1,
      repetitions: 0,
      sets: 0,
      duration: 0,
    });
  };

  const getExerciseName = (exerciseId: number) => {
    const exercise = exercises.find((ex) => ex.id_exercice === exerciseId);
    return exercise ? exercise.nom : "Exercice inconnu";
  };

  return (
    <>
      <Header title="Créer une séance" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => router.push("/sessions")}>
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la séance</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Full Body Débutant"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Tags</FormLabel>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Exercices</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExercise}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un exercice
                </Button>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">
                      Aucun exercice ajouté à cette séance.
                    </p>
                    <Button
                      type="button"
                      onClick={addExercise}
                      className="brand-gradient"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un exercice
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative border rounded-lg p-4"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center mb-4">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <span className="font-semibold text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                          <h3 className="font-medium">Exercice {index + 1}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.exerciseId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Exercice</FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(parseInt(value))
                                  }
                                  defaultValue={
                                    field.value
                                      ? field.value.toString()
                                      : undefined
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un exercice" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {exercises.map((exercise) => (
                                      <SelectItem
                                        key={exercise.id_exercice}
                                        value={exercise.id_exercice.toString()}
                                      >
                                        {exercise.nom}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.order`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ordre</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.repetitions`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Répétitions</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.sets`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Séries</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Durée (secondes)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {form.formState.errors.exercises &&
                  form.formState.errors.exercises.root && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.exercises.root.message}
                    </p>
                  )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/sessions")}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="brand-gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création en cours..." : "Créer la séance"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
