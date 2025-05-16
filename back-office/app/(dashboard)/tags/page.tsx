"use client";

import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
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
  DialogTrigger,
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import tagService from "@/services/tagService";
import { Tag, TagWithUsage } from "@/types/tag";

// Schéma de validation pour le formulaire de tag
const tagFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }),
  type: z.string().min(1, { message: "Le type est requis" }),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagWithUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
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

  // Formulaire pour créer un tag
  const createForm = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  // Formulaire pour modifier un tag
  const editForm = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
  });

  useEffect(() => {
    loadTags();
  }, [pagination.currentPage, pagination.limit, typeFilter]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const response = await tagService.getTags(
        pagination.currentPage,
        pagination.limit,
        typeFilter
      );
      setTags(response.data.tags);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async (data: TagFormValues) => {
    try {
      await tagService.createTag({
        name: data.name,
        type: data.type,
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      loadTags();
    } catch (error) {
      console.error("Erreur lors de la création du tag:", error);
    }
  };

  const handleEditTag = async (data: TagFormValues) => {
    if (!selectedTag) return;

    try {
      await tagService.updateTag(selectedTag.id_tag, {
        name: data.name,
        type: data.type,
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      loadTags();
    } catch (error) {
      console.error("Erreur lors de la modification du tag:", error);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      await tagService.deleteTag(selectedTag.id_tag);
      setIsDeleteDialogOpen(false);
      loadTags();
    } catch (error) {
      console.error("Erreur lors de la suppression du tag:", error);
    }
  };

  const handleViewTag = async (tag: Tag) => {
    try {
      const response = await tagService.getTagById(tag.id_tag);
      setSelectedTag(response.data.tag);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du tag:",
        error
      );
    }
  };

  const handleEditClick = (tag: Tag) => {
    editForm.reset({
      name: tag.nom,
      type: tag.type,
    });
    setSelectedTag(tag);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleFilterChange = (value: string) => {
    setTypeFilter(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, currentPage: 1 }));
  };

  const columns: {
    header: string;
    accessorKey: keyof Tag;
    cell?: (item: Tag) => React.ReactNode;
  }[] = [
    {
      header: "ID",
      accessorKey: "id_tag",
    },
    {
      header: "Nom",
      accessorKey: "nom",
      cell: (item: Tag) => <div className="font-medium">{item.nom}</div>,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item: Tag) => (
        <Badge variant={item.type === "sport" ? "default" : "secondary"}>
          {item.type === "sport" ? "Sport" : "Aliment"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id_tag",
      cell: (item: Tag) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewTag(item)}
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
      <Header title="Gestion des tags" />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Tags"
          description={`Total: ${pagination.total} tag${
            pagination.total > 1 ? "s" : ""
          }`}
          actionLabel="Ajouter un tag"
          onAction={() => setIsCreateDialogOpen(true)}
        />

        <div className="mb-6">
          <Select value={typeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              <SelectItem value="sport">Sport</SelectItem>
              <SelectItem value="aliment">Aliment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={tags}
          columns={columns}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pageSize: pagination.limit,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
          searchable
          onSearch={(query) => {
            setSearchTerm(query);
            // Note: l'API doit supporter la recherche
            // Pour l'instant, elle n'est pas implémentée dans les mocks
          }}
        />

        {/* Dialog pour créer un tag */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un tag</DialogTitle>
              <DialogDescription>
                Créer un nouveau tag pour catégoriser les exercices ou les
                aliments.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateTag)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du tag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
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
                          <SelectItem value="sport">Sport</SelectItem>
                          <SelectItem value="aliment">Aliment</SelectItem>
                        </SelectContent>
                      </Select>
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

        {/* Dialog pour modifier un tag */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier un tag</DialogTitle>
              <DialogDescription>
                Modifier les informations du tag sélectionné.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditTag)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du tag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
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
                          <SelectItem value="sport">Sport</SelectItem>
                          <SelectItem value="aliment">Aliment</SelectItem>
                        </SelectContent>
                      </Select>
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

        {/* Dialog pour voir les détails d'un tag */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails du tag</DialogTitle>
            </DialogHeader>
            {selectedTag && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">ID</p>
                    <p>{selectedTag.id_tag}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <Badge
                      variant={
                        selectedTag.type === "sport" ? "default" : "secondary"
                      }
                    >
                      {selectedTag.type === "sport" ? "Sport" : "Aliment"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="font-medium">{selectedTag.nom}</p>
                </div>
                {selectedTag.usageStats && (
                  <>
                    <div className="pt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Statistiques d'utilisation
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Aliments</p>
                          <p className="font-medium">
                            {selectedTag.usageStats.aliments}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Exercices</p>
                          <p className="font-medium">
                            {selectedTag.usageStats.exercices}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Programmes</p>
                          <p className="font-medium">
                            {selectedTag.usageStats.programmes}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Séances</p>
                          <p className="font-medium">
                            {selectedTag.usageStats.seances}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 bg-gray-100 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">
                          Total des usages
                        </p>
                        <p className="font-bold text-xl">
                          {selectedTag.usageStats.total}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation pour supprimer un tag */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Êtes-vous sûr de vouloir supprimer ce tag ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Si ce tag est utilisé dans
                d'autres éléments de l'application, la suppression pourrait être
                empêchée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteTag}
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
