const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.aliments.count();
    console.log(`Total aliments: ${count}`);

    if (count > 0) {
        const first = await prisma.aliments.findFirst();
        console.log("First aliment:", first);
    } else {
        console.log("No aliments found!");
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
