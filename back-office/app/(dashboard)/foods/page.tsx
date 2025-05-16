"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Coffee,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import foodService from "@/services/foodService";
import tagService from "@/services/tagService";
import { Food } from "@/types/food";
import { Tag } from "@/types/tag";

export default function FoodsPage() {
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [foodStats, setFoodStats] = useState<any>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  useEffect(() => {
    loadFoods();
    loadTags();
    loadFoodStats();
  }, [pagination.currentPage, pagination.limit]);

  const loadFoods = async (
    search = searchTerm,
    tagId = tagFilter,
    type = typeFilter,
    source = sourceFilter
  ) => {
    setIsLoading(true);
    try {
      const tagIdParam = tagId ? tagId.toString() : "";
      const response = await foodService.getFoods(
        pagination.currentPage,
        pagination.limit,
        search,
        type,
        tagIdParam,
        source
      );
      setFoods(response.data.foods);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des aliments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getTags(1, 100, "aliment");
      setTags(response.data.tags);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  const loadFoodStats = async () => {
    try {
      const response = await foodService.getFoodStats();
      setFoodStats(response.data.stats);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des statistiques des aliments:",
        error
      );
    }
  };

  const handleDeleteFood = async () => {
    if (!selectedFood) return;

    try {
      await foodService.deleteFood(selectedFood.id_aliment);
      setIsDeleteDialogOpen(false);
      loadFoods();
      loadFoodStats();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'aliment:", error);
    }
  };

  const handleViewFood = (food: Food) => {
    router.push(`/foods/${food.id_aliment}`);
  };

  const handleEditFood = (food: Food) => {
    router.push(`/foods/${food.id_aliment}/edit`);
  };

  const handleCreateFood = () => {
    router.push("/foods/create");
  };

  const handleDeleteClick = (food: Food) => {
    setSelectedFood(food);
    setIsDeleteDialogOpen(true);
  };

  const handleTagFilterChange = (tagId: string) => {
    const numTagId = tagId ? parseInt(tagId) : null;
    setTagFilter(numTagId);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadFoods(searchTerm, numTagId, typeFilter, sourceFilter);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadFoods(searchTerm, tagFilter, type, sourceFilter);
  };

  const handleSourceFilterChange = (source: string) => {
    setSourceFilter(source);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadFoods(searchTerm, tagFilter, typeFilter, source);
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadFoods();
  };

  const handleResetFilters = () => {
    setTagFilter(null);
    setTypeFilter("");
    setSourceFilter("");
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadFoods("", null, "", "");
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, currentPage: 1 }));
  };
  const columns: {
    header: string;
    accessorKey: keyof Food;
    cell?: (item: Food) => React.ReactNode;
  }[] = [
    {
      header: "ID",
      accessorKey: "id_aliment",
    },
    {
      header: "Nom",
      accessorKey: "nom",
      cell: (item: Food) => <div className="font-medium">{item.nom}</div>,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item: Food) => (
        <Badge variant={item.type === "recette" ? "secondary" : "outline"}>
          {item.type === "recette" ? "Recette" : "Produit"}
        </Badge>
      ),
    },
    {
      header: "Source",
      accessorKey: "source",
      cell: (food: Food) => {
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "outline";
        if (food.source === "admin") variant = "default";
        if (food.source === "user") variant = "secondary";

        return (
          <Badge variant={variant}>
            {food.source === "admin"
              ? "Admin"
              : food.source === "user"
              ? "Utilisateur"
              : "API"}
          </Badge>
        );
      },
    },
    {
      header: "Calories",
      accessorKey: "calories" as keyof Food,
      cell: (item: Food) => <div>{item.calories} kcal</div>,
    },
    {
      header: "Tags",
      accessorKey: "id_aliment",
      cell: (item: Food) => (
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
      accessorKey: "id_aliment",
      cell: (item: Food) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewFood(item)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditFood(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(item)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <Header title="Gestion des aliments" />

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="list">Liste des aliments</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <PageHeader
              title="Aliments"
              description={`Total: ${pagination.total} aliment${
                pagination.total > 1 ? "s" : ""
              }`}
              actionLabel="Ajouter un aliment"
              onAction={handleCreateFood}
            />

            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center mb-4">
                  <Filter className="mr-2 h-5 w-5 text-gray-400" />
                  <h3 className="font-medium">Filtres</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="ml-auto text-sm text-gray-500"
                  >
                    Réinitialiser
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={typeFilter}
                    onValueChange={handleTypeFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'aliment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les types</SelectItem>
                      <SelectItem value="produit">Produit</SelectItem>
                      <SelectItem value="recette">Recette</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sourceFilter}
                    onValueChange={handleSourceFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les sources</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={tagFilter?.toString() || ""}
                    onValueChange={handleTagFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les tags</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem
                          key={tag.id_tag}
                          value={tag.id_tag.toString()}
                        >
                          {tag.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Rechercher un aliment..."
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
              data={foods}
              columns={columns}
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                pageSize: pagination.limit,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
              }}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <h2 className="text-xl font-bold mb-6">
              Statistiques des aliments
            </h2>

            {foodStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total</CardTitle>
                      <CardDescription>Nombre total d'aliments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-brand-gradient">
                        {foodStats.total}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Par type</CardTitle>
                      <CardDescription>Répartition par type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Produits</span>
                          <Badge variant="outline">
                            {foodStats.byType.produit}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Recettes</span>
                          <Badge variant="secondary">
                            {foodStats.byType.recette}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Par source</CardTitle>
                      <CardDescription>Répartition par source</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Admin</span>
                          <Badge variant="default">
                            {foodStats.bySource.admin}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Utilisateurs</span>
                          <Badge variant="secondary">
                            {foodStats.bySource.user}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>API</span>
                          <Badge variant="outline">
                            {foodStats.bySource.api}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags les plus utilisés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {foodStats.topTags.map((tag: any) => (
                          <div
                            key={tag.id}
                            className="flex justify-between items-center"
                          >
                            <span>{tag.name}</span>
                            <Badge variant="outline">
                              {tag.count} aliments
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Aliments les plus utilisés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {foodStats.mostUsed.map((food: any) => (
                          <div
                            key={food.id}
                            className="flex justify-between items-center"
                          >
                            <span>{food.name}</span>
                            <Badge variant="outline">
                              {food.usageCount} utilisations
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Chargement des statistiques...
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de confirmation pour supprimer un aliment */}
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
                Cette action est irréversible. Si cet aliment est utilisé dans
                des suivis nutritionnels, la suppression pourrait être empêchée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteFood}
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
