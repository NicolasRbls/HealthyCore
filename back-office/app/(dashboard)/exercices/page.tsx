"use client";

import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash2, Search, Tag } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import exerciseService from "@/services/exerciseService";
import tagService from "@/services/tagService";
import { Exercise, ExerciseWithUsage } from "@/types/exercise";
import { Tag as TagType } from "@/types/tag";

// Schéma de validation pour le formulaire d'exercice
const exerciseFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }),
  description: z.string().min(1, { message: "La description est requise" }),
  equipment: z.string().optional(),
  gif: z.string().url({ message: "URL invalide" }).optional().or(z.literal("")),
  tagIds: z
    .array(z.number())
    .min(1, { message: "Sélectionnez au moins un tag" }),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  // Formulaire pour créer un exercice
  const createForm = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      equipment: "",
      gif: "",
      tagIds: [],
    },
  });

  // Formulaire pour modifier un exercice
  const editForm = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
  });

  useEffect(() => {
    loadExercises();
    loadTags();
  }, [pagination.currentPage, pagination.limit]);

  const loadExercises = async (search = searchTerm, tagId = tagFilter) => {
    setIsLoading(true);
    try {
      const tagIdParam = tagId ? tagId.toString() : "";
      const response = await exerciseService.getExercises(
        pagination.currentPage,
        pagination.limit,
        search,
        tagIdParam
      );
      setExercises(response.data.exercises);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des exercices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "sport");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const handleCreateExercise = async (data: ExerciseFormValues) => {
    try {
      await exerciseService.createExercise({
        name: data.name,
        description: data.description,
        equipment: data.equipment,
        gif: data.gif,
        tagIds: data.tagIds,
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      loadExercises();
    } catch (error) {
      console.error("Erreur lors de la création de l'exercice:", error);
    }
  };

  const handleEditExercise = async (data: ExerciseFormValues) => {
    if (!selectedExercise) return;

    try {
      await exerciseService.updateExercise(selectedExercise.id_exercice, {
        name: data.name,
        description: data.description,
        equipment: data.equipment,
        gif: data.gif,
        tagIds: data.tagIds,
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      loadExercises();
    } catch (error) {
      console.error("Erreur lors de la modification de l'exercice:", error);
    }
  };

  const handleDeleteExercise = async () => {
    if (!selectedExercise) return;

    try {
      await exerciseService.deleteExercise(selectedExercise.id_exercice);
      setIsDeleteDialogOpen(false);
      loadExercises();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'exercice:", error);
    }
  };

  const handleViewExercise = async (exercise: Exercise) => {
    try {
      const response = await exerciseService.getExerciseById(
        exercise.id_exercice
      );
      setSelectedExercise(response.data.exercise);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'exercice:",
        error
      );
    }
  };

  const handleEditClick = async (exercise: Exercise) => {
    try {
      const response = await exerciseService.getExerciseById(
        exercise.id_exercice
      );
      const exerciseDetail = response.data.exercise;

      editForm.reset({
        name: exerciseDetail.nom,
        description: exerciseDetail.description,
        equipment: exerciseDetail.equipement || "",
        gif: exerciseDetail.gif || "",
        tagIds: exerciseDetail.tags?.map((tag) => tag.id_tag) || [],
      });

      setSelectedExercise(exerciseDetail);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'exercice:",
        error
      );
    }
  };

  const handleDeleteClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDeleteDialogOpen(true);
  };

  const handleTagFilterChange = (tagId: string) => {
    const numTagId = tagId ? parseInt(tagId) : null;
    setTagFilter(numTagId);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadExercises(searchTerm, numTagId);
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadExercises();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, currentPage: 1 }));
  };

  const columns: {
    header: string;
    accessorKey: keyof Exercise;
    cell?: (item: Exercise) => React.ReactNode;
  }[] = [
    {
      header: "ID",
      accessorKey: "id_exercice",
    },
    {
      header: "Nom",
      accessorKey: "nom",
      cell: (item: Exercise) => <div className="font-medium">{item.nom}</div>,
    },
    {
      header: "Équipement",
      accessorKey: "equipement",
      cell: (item: Exercise) => <div>{item.equipement || "Aucun"}</div>,
    },
    {
      header: "Tags",
      accessorKey: "id_exercice",
      cell: (item: Exercise) => (
        <div className="flex flex-wrap gap-1">
          {item.tags &&
            item.tags.map((tag) => (
              <Badge key={tag.id_tag} variant="outline" className="mr-1">
                {tag.nom}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id_exercice",
      cell: (item: Exercise) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewExercise(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEditClick(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="Gestion des exercices" />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Exercices"
          description={`Total: ${pagination.total} exercice${
            pagination.total > 1 ? "s" : ""
          }`}
          actionLabel="Ajouter un exercice"
          onAction={() => setIsCreateDialogOpen(true)}
        />

        <div className="mb-6 flex flex-wrap gap-4">
          <Select
            value={tagFilter?.toString() || ""}
            onValueChange={handleTagFilterChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrer par tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id_tag} value={tag.id_tag.toString()}>
                  {tag.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 flex">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Rechercher un exercice..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="ml-2 brand-gradient" onClick={handleSearch}>
              Rechercher
            </Button>
          </div>
        </div>

        <DataTable
          data={exercises}
          columns={columns}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pageSize: pagination.limit,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />

        {/* Dialog pour créer un exercice */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un exercice</DialogTitle>
              <DialogDescription>
                Créer un nouvel exercice pour les séances d'entraînement.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateExercise)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'exercice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée de l'exercice"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Équipement</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Équipement nécessaire"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Facultatif - ex: "Haltères, Banc"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="gif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien GIF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="URL du GIF démonstratif"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Facultatif - URL du GIF démonstratif
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="tagIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Tags</FormLabel>
                        <FormDescription>
                          Sélectionnez au moins un tag
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {tags.map((tag) => (
                          <FormField
                            key={tag.id_tag}
                            control={createForm.control}
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="brand-gradient">
                    Créer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog pour modifier un exercice */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier un exercice</DialogTitle>
              <DialogDescription>
                Modifier les informations de l'exercice sélectionné.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditExercise)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'exercice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée de l'exercice"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Équipement</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Équipement nécessaire"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Facultatif - ex: "Haltères, Banc"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="gif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien GIF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="URL du GIF démonstratif"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Facultatif - URL du GIF démonstratif
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="tagIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Tags</FormLabel>
                        <FormDescription>
                          Sélectionnez au moins un tag
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {tags.map((tag) => (
                          <FormField
                            key={tag.id_tag}
                            control={editForm.control}
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="brand-gradient">
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog pour voir les détails d'un exercice */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de l'exercice</DialogTitle>
            </DialogHeader>
            {selectedExercise && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedExercise.nom}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedExercise.tags?.map((tag) => (
                        <Badge key={tag.id_tag} variant="outline">
                          {tag.nom}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      {selectedExercise.description}
                    </p>
                    {selectedExercise.equipement && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Équipement:
                        </h4>
                        <p>{selectedExercise.equipement}</p>
                      </div>
                    )}

                    {selectedExercise.usageStats && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Statistiques d'utilisation
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500">Séances</p>
                            <p className="font-medium">
                              {selectedExercise.usageStats.sessions}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500">Programmes</p>
                            <p className="font-medium">
                              {selectedExercise.usageStats.programs}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedExercise.gif && (
                    <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={selectedExercise.gif}
                        alt={selectedExercise.nom}
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleEditClick(selectedExercise as Exercise)}
                className="mr-2"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation pour supprimer un exercice */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Êtes-vous sûr de vouloir supprimer cet exercice ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Si cet exercice est utilisé dans
                des séances ou des programmes, la suppression pourrait être
                empêchée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteExercise}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
