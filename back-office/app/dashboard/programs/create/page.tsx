"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, BookOpen } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import programService from "@/services/programService";
import sessionService from "@/services/sessionService";
import tagService from "@/services/tagService";
import { Session } from "@/types/session";
import { Tag } from "@/types/tag";

// Schéma de validation pour le formulaire de programme
const programSessionSchema = z.object({
  sessionId: z.number({
    required_error: "Sélectionnez une séance",
  }),
  order: z.number().min(1),
});

const programFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }),
  image: z
    .string()
    .url({ message: "URL invalide" })
    .optional()
    .or(z.literal("")),
  duration: z
    .number()
    .min(1, { message: "La durée doit être d'au moins 1 jour" }),
  tagIds: z
    .array(z.number())
    .min(1, { message: "Sélectionnez au moins un tag" }),
  sessions: z
    .array(programSessionSchema)
    .min(1, { message: "Ajoutez au moins une séance" }),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

export default function CreateProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire pour créer un programme
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: "",
      image: "",
      duration: 28,
      tagIds: [],
      sessions: [],
    },
  });

  // Utilisation de useFieldArray pour gérer la liste de séances
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sessions",
  });

  useEffect(() => {
    loadTags();
    loadSessions();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "sport");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await sessionService.getSessions(1, 100);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Erreur lors du chargement des séances:", error);
    }
  };

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      await programService.createProgram({
        name: data.name,
        image: data.image,
        duration: data.duration,
        tagIds: data.tagIds,
        sessions: data.sessions.map((s) => ({
          sessionId: s.sessionId,
          order: s.order,
        })),
      });

      toast({
        title: "Programme créé",
        description: "Le programme a été créé avec succès",
      });

      router.push("/dashboard/programs");
    } catch (error) {
      console.error("Erreur lors de la création du programme:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du programme",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSession = () => {
    append({
      sessionId: 0,
      order: fields.length + 1,
    });
  };

  const getSessionName = (sessionId: number) => {
    const session = sessions.find((s) => s.id_seance === sessionId);
    return session ? session.nom : "Séance inconnue";
  };

  return (
    <>
      <Header title="Créer un programme" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/programs")}
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du programme</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex : Programme Full Body 6 semaines"
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
                        URL vers une image représentant le programme
                        (facultatif)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (jours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="28"
                          {...field}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 28)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Durée totale du programme en jours (ex: 28 pour 4
                        semaines)
                      </FormDescription>
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
                <CardTitle>Séances</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSession}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une séance
                </Button>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">
                      Aucune séance ajoutée à ce programme.
                    </p>
                    <Button
                      type="button"
                      onClick={addSession}
                      className="brand-gradient"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une séance
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
                          <h3 className="font-medium">Séance {index + 1}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`sessions.${index}.sessionId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Séance</FormLabel>
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
                                      <SelectValue placeholder="Sélectionner une séance" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sessions.map((session) => (
                                      <SelectItem
                                        key={session.id_seance}
                                        value={session.id_seance.toString()}
                                      >
                                        {session.nom}
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
                            name={`sessions.${index}.order`}
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
                      </div>
                    ))}
                  </div>
                )}
                {form.formState.errors.sessions &&
                  form.formState.errors.sessions.root && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.sessions.root.message}
                    </p>
                  )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/programs")}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="brand-gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création en cours..." : "Créer le programme"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
