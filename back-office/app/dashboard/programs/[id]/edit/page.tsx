"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import programService from "@/services/programService";
import sessionService from "@/services/sessionService";
import tagService from "@/services/tagService";
import { Session } from "@/types/session";
import { Tag } from "@/types/tag";
import { ProgramWithSessions } from "@/types/program";

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

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = Number(params.id);
  const { toast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [program, setProgram] = useState<ProgramWithSessions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire pour modifier un programme
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
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "sessions",
  });

  useEffect(() => {
    loadTags();
    loadAllSessions();
    if (programId) {
      loadProgramDetails();
    }
  }, [programId]);

  useEffect(() => {
    if (program && allSessions.length > 0 && tags.length > 0) {
      // Préparer les données pour le formulaire
      form.reset({
        name: program.nom,
        image: program.image || "",
        duration: program.duration,
        tagIds: program.tags?.map((tag) => tag.id_tag) || [],
        sessions:
          program.sessions?.map((session) => ({
            sessionId: session.id,
            order: session.orderInProgram,
          })) || [],
      });
    }
  }, [program, allSessions, tags, form.reset]);

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "sport");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const loadAllSessions = async () => {
    try {
      const response = await sessionService.getSessions(1, 100);
      setAllSessions(response.data.sessions);
    } catch (error) {
      console.error("Erreur lors du chargement des séances:", error);
    }
  };

  const loadProgramDetails = async () => {
    setIsLoading(true);
    try {
      const response = await programService.getProgramById(programId);
      setProgram(response.data.program);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails du programme:",
        error
      );
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      await programService.updateProgram(programId, {
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
        title: "Programme mis à jour",
        description: "Le programme a été mis à jour avec succès",
      });

      router.push(`/dashboard/programs/${programId}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du programme:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du programme",
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

  if (isLoading) {
    return (
      <>
        <Header title="Modifier le programme" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement des détails du programme...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!program) {
    return (
      <>
        <Header title="Modifier le programme" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">Programme non trouvé.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/dashboard/programs")}
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
      <Header title={`Modifier : ${program.nom}`} />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/programs/${programId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux détails
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
                                  value={
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
                                    {allSessions.map((session) => (
                                      <SelectItem
                                        key={session.id}
                                        value={session.id.toString()}
                                      >
                                        {session.name}
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
                onClick={() => router.push(`/dashboard/programs/${programId}`)}
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
