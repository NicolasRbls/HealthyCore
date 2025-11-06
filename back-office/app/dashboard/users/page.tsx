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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage, pagination.limit]);

  const loadUsers = async (search = searchTerm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers(
        pagination.currentPage,
        pagination.limit,
        search
      );

      // Vérifier la structure de la réponse
      if (
        !response.data?.users?.users ||
        !Array.isArray(response.data.users.users)
      ) {
        throw new Error("Format de réponse inattendu");
      }

      // Extraire correctement le tableau d'utilisateurs depuis la structure imbriquée
      const usersList = response.data.users.users;
      setUsers(usersList);

      // Extraire et convertir les données de pagination en nombres
      const paginationData = response.data.pagination;
      setPagination({
        currentPage: parseInt(String(paginationData.currentPage)) || 1,
        totalPages: parseInt(String(paginationData.totalPages)) || 1,
        total: parseInt(String(paginationData.total)) || 0,
        limit:
          parseInt(String(paginationData.perPage || paginationData.limit)) ||
          10,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setError("Impossible de charger la liste des utilisateurs");
      setUsers([]);
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
    router.push(`/dashboard/users/${user.id_user}`);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || !confirmPassword) return;

    try {
      await userService.deleteUser(selectedUser.id_user, confirmPassword);
      setDeleteDialogOpen(false);
      setConfirmPassword("");

      // Recharger la liste après suppression
      loadUsers();
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);

      // Afficher un message d'erreur spécifique si disponible
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de la suppression de l'utilisateur";
      alert(errorMessage);
    }
  };

  const columns: {
    header: string;
    accessorKey: keyof User;
    cell?: (item: User) => React.ReactNode;
  }[] = [
    {
      header: "ID",
      accessorKey: "id_user",
    },
    {
      header: "Nom",
      accessorKey: "nom",
      cell: (item: User) => (
        <div className="font-medium">
          {item.prenom} {item.nom}
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Genre",
      accessorKey: "sexe",
      cell: (item: User) => (
        <Badge variant="outline">
          {item.sexe === "H"
            ? "Homme"
            : item.sexe === "F"
            ? "Femme"
            : "Non spécifié"}
        </Badge>
      ),
    },
    {
      header: "Date d'inscription",
      accessorKey: "cree_a",
      cell: (item: User) => (
        <span>
          {format(new Date(item.cree_a), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      header: "Rôle",
      accessorKey: "role",
      cell: (item: User) => (
        <Badge variant={item.role === "admin" ? "destructive" : "default"}>
          {item.role === "admin" ? "Admin" : "Utilisateur"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id_user",
      cell: (item: User) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewUser(item)}
          >
            <Eye className="h-4 w-4" />
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
      <Header title="Gestion des utilisateurs" />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          title="Utilisateurs"
          description={`Total : ${pagination.total} utilisateur${
            pagination.total > 1 ? "s" : ""
          }`}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
            <Button
              variant="link"
              className="ml-2 text-red-600"
              onClick={() => loadUsers()}
            >
              Réessayer
            </Button>
          </div>
        )}

        <div className="mb-6">
          <div className="flex">
            <div className="relative flex-1">
              <Input
                placeholder="Rechercher un utilisateur..."
                className="w-full"
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
          data={users}
          columns={columns}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pageSize: pagination.limit,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
          searchable={false} // Désactivé car nous utilisons notre propre système de recherche
          isLoading={isLoading}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes les données associées à
                {selectedUser && (
                  <strong>
                    {" "}
                    {selectedUser.prenom} {selectedUser.nom}{" "}
                  </strong>
                )}
                seront définitivement supprimées.
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
              <AlertDialogCancel onClick={() => setConfirmPassword("")}>
                Annuler
              </AlertDialogCancel>
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
