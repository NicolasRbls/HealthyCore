"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Tag,
  Plus,
  MoreHorizontal,
  Calendar,
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
import programService from "@/services/programService";
import tagService from "@/services/tagService";
import { Program } from "@/types/program";
import { Tag as TagType } from "@/types/tag";

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  useEffect(() => {
    loadPrograms();
    loadTags();
  }, [pagination.currentPage, pagination.limit]);

  const loadPrograms = async (search = searchTerm, tagId = tagFilter) => {
    setIsLoading(true);
    try {
      const tagIdParam = tagId ? tagId.toString() : "";
      const response = await programService.getPrograms(
        pagination.currentPage,
        pagination.limit,
        search,
        tagIdParam
      );
      setPrograms(response.data.programs);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des programmes:", error);
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

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;

    try {
      await programService.deleteProgram(selectedProgram.id_programme);
      setIsDeleteDialogOpen(false);
      loadPrograms();
    } catch (error) {
      console.error("Erreur lors de la suppression du programme:", error);
    }
  };

  const handleViewProgram = (program: Program) => {
    router.push(`/programs/${program.id_programme}`);
  };

  const handleEditProgram = (program: Program) => {
    router.push(`/programs/${program.id_programme}/edit`);
  };

  const handleCreateProgram = () => {
    router.push("/programs/create");
  };

  const handleDeleteClick = (program: Program) => {
    setSelectedProgram(program);
    setIsDeleteDialogOpen(true);
  };

  const handleTagFilterChange = (tagId: string) => {
    const numTagId = tagId ? parseInt(tagId) : null;
    setTagFilter(numTagId);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadPrograms(searchTerm, numTagId);
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadPrograms();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, currentPage: 1 }));
  };

  const columns: {
    header: string;
    accessorKey: keyof Program;
    cell?: (item: Program) => React.ReactNode;
  }[] = [
    {
      header: "ID",
      accessorKey: "id_programme",
    },
    {
      header: "Nom",
      accessorKey: "nom",
      cell: (item: Program) => <div className="font-medium">{item.nom}</div>,
    },
    {
      header: "Durée (jours)",
      accessorKey: "duration",
    },
    {
      header: "Séances",
      accessorKey: "sessionCount",
      cell: (item: Program) => <div>{item.sessionCount || 0} séances</div>,
    },
    {
      header: "Créé par",
      accessorKey: "id_programme",
      cell: (item: Program) => <div>{item.createdBy?.name || "Admin"}</div>,
    },
    {
      header: "Tags",
      accessorKey: "id_programme",
      cell: (item: Program) => (
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
      accessorKey: "id_programme",
      cell: (item: Program) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewProgram(item)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditProgram(item)}>
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
      <Header title="Gestion des programmes" />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Programmes"
          description={`Total: ${pagination.total} programme${
            pagination.total > 1 ? "s" : ""
          }`}
          actionLabel="Ajouter un programme"
          onAction={handleCreateProgram}
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
                placeholder="Rechercher un programme..."
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
          data={programs}
          columns={columns}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pageSize: pagination.limit,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />

        {/* Dialog de confirmation pour supprimer un programme */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Êtes-vous sûr de vouloir supprimer ce programme ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Si ce programme est utilisé par
                des utilisateurs, la suppression pourrait être empêchée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteProgram}
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
