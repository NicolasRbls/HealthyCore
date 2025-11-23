"use client";

import { useEffect, useState } from "react";
import { Signalement, signalementService } from "@/services/signalementService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

export default function SignalementsPage() {
    const [data, setData] = useState<Signalement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const signalements = await signalementService.getAll();
            setData(signalements);
        } catch (error) {
            console.error("Error loading signalements:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Signalements"
                description="Gérez les signalements d'aliments et de recettes."
            />

            {loading ? (
                <div>Chargement...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="aliments.nom" />
            )}
        </div>
    );
}
