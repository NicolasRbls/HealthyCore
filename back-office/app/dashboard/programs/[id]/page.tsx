"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import programService from "@/services/programService";
import { ProgramWithSessions } from "@/types/program";

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<ProgramWithSessions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (programId) {
      loadProgramDetails();
    }
  }, [programId]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    router.push(`/dashboard/programs/${programId}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await programService.deleteProgram(programId);
      setIsDeleteDialogOpen(false);
      router.push("/dashboard/programs");
    } catch (error) {
      console.error("Erreur lors de la suppression du programme:", error);
    }
  };

  const handleViewSession = (sessionId: number) => {
    router.push(`/dashboard/sessions/${sessionId}`);
  };

  if (isLoading) {
    return (
      <>
        <Header title="Détails du programme" />
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
        <Header title="Détails du programme" />
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
      <Header title={program.nom} />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/programs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">{program.nom}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {program.tags &&
                        program.tags.map((tag) => (
                          <Badge key={tag.id_tag} variant="outline">
                            {tag.nom}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 w-32">Durée:</span>
                      <span className="font-medium">
                        {program.duration} jours
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 w-32">
                        Séances:
                      </span>
                      <span className="font-medium">
                        {program.sessions?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 w-32">
                        Créé par:
                      </span>
                      <span className="font-medium">
                        {program.createdBy?.name || "Admin"}
                      </span>
                    </div>
                  </div>

                  {program.usageStats && (
                    <div className="pt-4 border-t mt-4">
                      <h3 className="text-md font-semibold mb-3">
                        Utilisation
                      </h3>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-500 w-32">
                          Utilisateurs:
                        </span>
                        <span className="font-medium">
                          {program.usageStats.users}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-full">
                {program.image ? (
                  <img
                    src={program.image}
                    alt={program.nom}
                    className="max-w-full h-auto max-h-[200px] object-contain rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liste des séances */}
        <Card>
          <CardHeader>
            <CardTitle>Séances du programme</CardTitle>
          </CardHeader>
          <CardContent>
            {program.sessions && program.sessions.length > 0 ? (
              <div className="space-y-6">
                {program.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="font-semibold text-gray-600">
                            {session.orderInProgram}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{session.name}</h3>
                          <p className="text-sm text-gray-500">
                            {session.exerciseCount} exercices
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSession(session.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Aucune séance dans ce programme.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleEditClick}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Ajouter des séances
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              Cette action est irréversible. Si ce programme est utilisé par des
              utilisateurs, la suppression pourrait être empêchée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
