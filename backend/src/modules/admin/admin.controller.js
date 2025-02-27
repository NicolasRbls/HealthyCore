const prisma = require("../../config/prisma");

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getAllUsers };