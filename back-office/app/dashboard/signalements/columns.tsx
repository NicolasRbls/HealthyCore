"use client";

import { Signalement, signalementService } from "@/services/signalementService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const columns = [
    {
        accessorKey: "id_signalement_utilisateur",
        header: "ID",
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: (signalement: Signalement) => {
            const date = new Date(signalement.date);
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: (signalement: Signalement) => {
            return <div>{signalement.signalements?.titre || "N/A"}</div>;
        },
    },
    {
        accessorKey: "aliment",
        header: "Aliment",
        cell: (signalement: Signalement) => {
            return <div>{signalement.aliments?.nom || "N/A"}</div>;
        },
    },
    {
        accessorKey: "user",
        header: "Utilisateur",
        cell: (signalement: Signalement) => {
            return <div>{signalement.users?.email || "N/A"}</div>;
        },
    },
    {
        accessorKey: "statut",
        header: "Statut",
        cell: (signalement: Signalement) => {
            const statut = signalement.statut;
            let variant: "default" | "secondary" | "destructive" | "outline" =
                "default";

            switch (statut) {
                case "non_revue":
                    variant = "secondary";
                    break;
                case "traite":
                    variant = "default";
                    break;
                case "ignore":
                    variant = "outline";
                    break;
            }

            return <Badge variant={variant}>{statut}</Badge>;
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: (signalement: Signalement) => {
            const handleStatusUpdate = async (
                newStatus: "non_revue" | "traite" | "ignore"
            ) => {
                try {
                    await signalementService.updateStatus(
                        signalement.id_signalement_utilisateur,
                        newStatus
                    );
                    toast({
                        title: "Succès",
                        description: "Statut mis à jour avec succès",
                    });
                    window.location.reload();
                } catch {
                    toast({
                        title: "Erreur",
                        description: "Impossible de mettre à jour le statut",
                        variant: "destructive",
                    });
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(signalement.description || "")}
                        >
                            Copier la description
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusUpdate("traite")}>
                            Marquer comme traité
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate("ignore")}>
                            Ignorer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate("non_revue")}>
                            Marquer comme non revu
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
