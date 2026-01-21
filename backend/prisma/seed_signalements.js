require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding signalement types...");
    const signalements = [
        { titre: "Information incorrecte" },
        { titre: "Aliment dangereux" },
        { titre: "Doublon" },
        { titre: "Autre" },
    ];

    for (const sig of signalements) {
        const exists = await prisma.signalements.findFirst({
            where: { titre: sig.titre },
        });
        if (!exists) {
            await prisma.signalements.create({ data: sig });
            console.log(`Created signalement type: ${sig.titre}`);
        } else {
            console.log(`Signalement type already exists: ${sig.titre}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
