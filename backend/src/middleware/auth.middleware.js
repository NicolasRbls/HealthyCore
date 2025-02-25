const { verifyToken } = require("../utils/jwt.utils");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);

    const user = await prisma.users.findUnique({
      where: { id_user: decoded.userId },
      select: {
        id_user: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Token verification error:", error);
    return res.status(500).json({ message: "Token verification error" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
};

module.exports = {
  checkAuth,
  isAdmin,
};
