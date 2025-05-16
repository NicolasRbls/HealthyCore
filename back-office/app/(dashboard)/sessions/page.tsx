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
} from "lucide-react";
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
import sessionService from "@/services/sessionService";
import tagService from "@/services/tagService";
import { Session } from "@/types/session";
import { Tag as TagType } from "@/types/tag";

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
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
    loadSessions();
    loadTags();
  }, [pagination.currentPage, pagination.limit]);

  const loadSessions = async (search = searchTerm, tagId = tagFilter) => {
    setIsLoading(true);
    try {
      const tagIdParam = tagId ? tagId.toString() : "";
      const response = await sessionService.getSessions(
        pagination.currentPage,
        pagination.limit,
        search,
        tagIdParam
      );
      setSessions(response.data.sessions);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des séances:", error);
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

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    try {
      await sessionService.deleteSession(selectedSession.id_seance);
      setIsDeleteDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error("Erreur lors de la suppression de la séance:", error);
    }
  };

  const handleViewSession = (session: Session) => {
    router.push(`/sessions/${session.id_seance}`);
  };

  const handleEditSession = (session: Session) => {
    router.push(`/sessions/${session.id_seance}/edit`);
  };

  const handleCreateSession = () => {
    router.push("/sessions/create");
  };

  const handleDeleteClick = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteDialogOpen(true);
  };

  const handleTagFilterChange = (tagId: string) => {
    const numTagId = tagId ? parseInt(tagId) : null;
    setTagFilter(numTagId);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadSessions(searchTerm, numTagId);
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadSessions();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, currentPage: 1 }));
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id_seance" as keyof Session,
    },
    {
      header: "Nom",
      accessorKey: "nom" as keyof Session,
      cell: (session: Session) => (
        <div className="font-medium">{session.nom}</div>
      ),
    },
    {
      header: "Exercices",
      accessorKey: "exerciseCount" as keyof Session,
      cell: (session: Session) => (
        <div>{session.exerciseCount || 0} exercices</div>
      ),
    },
    {
      header: "Créée par",
      accessorKey: "createdBy",
      cell: (session: Session) => (
        <div>{session.createdBy?.name || "Admin"}</div>
      ),
    },
    {
      header: "Tags",
      accessorKey: "tags",
      cell: (session: Session) => (
        <div className="flex flex-wrap gap-1">
          {session.tags &&
            session.tags.map((tag) => (
              <Badge key={tag.id_tag} variant="outline" className="mr-1">
                {tag.nom}
              </Badge>
            ))}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (session: Session) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewSession(session)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditSession(session)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(session)}
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
      <Header title="Gestion des séances" />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Séances"
          description={`Total: ${pagination.total} séance${
            pagination.total > 1 ? "s" : ""
          }`}
          actionLabel="Ajouter une séance"
          onAction={handleCreateSession}
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
                placeholder="Rechercher une séance..."
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
          data={sessions}
          columns={columns}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pageSize: pagination.limit,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />

        {/* Dialog de confirmation pour supprimer une séance */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Êtes-vous sûr de vouloir supprimer cette séance ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Si cette séance est utilisée dans
                des programmes, la suppression pourrait être empêchée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteSession}
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
