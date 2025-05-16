"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Dumbbell,
  Repeat,
  Timer,
  Calendar,
  Users,
} from "lucide-react";
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
import sessionService from "@/services/sessionService";
import { SessionWithExercises } from "@/types/session";

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Number(params.id);

  const [session, setSession] = useState<SessionWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadSessionDetails = async () => {
    setIsLoading(true);
    try {
      const response = await sessionService.getSessionById(sessionId);
      setSession(response.data.session);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails de la séance:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    router.push(`/sessions/${sessionId}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await sessionService.deleteSession(sessionId);
      setIsDeleteDialogOpen(false);
      router.push("/sessions");
    } catch (error) {
      console.error("Erreur lors de la suppression de la séance:", error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Détails de la séance" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement des détails de la séance...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Header title="Détails de la séance" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">Séance non trouvée.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/sessions")}
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
      <Header title={session.nom} />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => router.push("/sessions")}>
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">{session.nom}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {session.tags &&
                    session.tags.map((tag) => (
                      <Badge key={tag.id_tag} variant="outline">
                        {tag.nom}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">
                    Nombre d'exercices:
                  </span>
                  <span className="font-medium">
                    {session.exercises?.length || 0}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500 w-32">Créée par:</span>
                  <span className="font-medium">
                    {session.createdBy?.name || "Admin"}
                  </span>
                </div>
              </div>

              {session.usageStats && (
                <div className="pt-4 border-t mt-4">
                  <h3 className="text-md font-semibold mb-3">Utilisation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 w-32">
                        Programmes:
                      </span>
                      <span className="font-medium">
                        {session.usageStats.programs}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 w-32">
                        Utilisateurs:
                      </span>
                      <span className="font-medium">
                        {session.usageStats.users}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des exercices */}
        <Card>
          <CardHeader>
            <CardTitle>Exercices de la séance</CardTitle>
          </CardHeader>
          <CardContent>
            {session.exercises && session.exercises.length > 0 ? (
              <div className="space-y-6">
                {session.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="font-semibold text-gray-600">
                            {exercise.orderInSession}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{exercise.name}</h3>
                          <p className="text-sm text-gray-500">
                            {exercise.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      {exercise.repetitions && exercise.repetitions > 0 && (
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">
                            <span className="text-gray-500">Répétitions: </span>
                            <span className="font-medium">
                              {exercise.repetitions}
                            </span>
                          </span>
                        </div>
                      )}

                      {exercise.sets && exercise.sets > 0 && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">
                            <span className="text-gray-500">Séries: </span>
                            <span className="font-medium">{exercise.sets}</span>
                          </span>
                        </div>
                      )}

                      {exercise.duration > 0 && (
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">
                            <span className="text-gray-500">Durée: </span>
                            <span className="font-medium">
                              {exercise.duration} sec
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Aucun exercice dans cette séance.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleEditClick}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Ajouter des exercices
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
