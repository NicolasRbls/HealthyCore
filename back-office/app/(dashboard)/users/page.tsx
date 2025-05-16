"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import userService from "@/services/userService";
import { User } from "@/types/user";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage, pagination.limit]);

  const loadUsers = async (search = searchTerm) => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers(
        pagination.currentPage,
        pagination.limit,
        search
      );
      setUsers(response.data.users);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadUsers();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, currentPage: 1 }));
  };

  const handleViewUser = (user: User) => {
    router.push(`/users/${user.id_user}`);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id_user, confirmPassword);
      setDeleteDialogOpen(false);
      setConfirmPassword("");
      loadUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id_user" as keyof User,
    },
    {
      header: "Nom",
      accessorKey: "nom" as keyof User,
      cell: (user: User) => (
        <div className="font-medium">
          {user.prenom} {user.nom}
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email" as keyof User,
    },
    {
      header: "Genre",
      accessorKey: "sexe" as keyof User,
      cell: (user: User) => (
        <Badge variant="outline">
          {user.sexe === "H"
            ? "Homme"
            : user.sexe === "F"
            ? "Femme"
            : "Non spécifié"}
        </Badge>
      ),
    },
    {
      header: "Date d'inscription",
      accessorKey: "cree_a" as keyof User,
      cell: (user: User) => (
        <span>
          {format(new Date(user.cree_a), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      header: "Rôle",
      accessorKey: "role" as keyof User,
      cell: (user: User) => (
        <Badge variant={user.role === "admin" ? "destructive" : "default"}>
          {user.role === "admin" ? "Admin" : "Utilisateur"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewUser(user)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="Gestion des utilisateurs" />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Utilisateurs"
          description={`Total: ${pagination.total} utilisateur${
            pagination.total > 1 ? "s" : ""
          }`}
        />

        <DataTable
          data={users}
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
            handleSearch();
          }}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes les données associées à
                cet utilisateur seront définitivement supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">
                Entrez votre mot de passe administrateur pour confirmer
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Mot de passe"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleConfirmDelete}
                disabled={!confirmPassword}
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
