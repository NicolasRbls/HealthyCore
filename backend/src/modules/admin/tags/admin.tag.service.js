const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getTagById = async (id_tag) => {
  const tag = await prisma.tags.findUnique({
    where: {
      id_tag: id_tag,
    },
    select: {
      id_tag: true,
      nom: true,
      type: true,
    },
  });
  return tag;
};

const getTagCountByType = async (type) => {
  const count = await prisma.tags.count({
    where: {
      ...(type && { type: type }),
    },
  });
  return count;
};

const getAllTags = async (param) => {
  const { page, limit, type } = param;
  const tags = await prisma.tags.findMany({
    where: {
      ...(type && { type: type }),
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id_tag: true,
      nom: true,
      type: true,
    },
    orderBy: {
      id_tag: "asc",
    },
  });
  return tags;
};

const updateTag = async (id_tag, data) => {
  const uneditedTag = await getTagById(id_tag); // Correction: déclaration de la variable
  if (!uneditedTag) {
    return null;
  }

  // Utiliser les valeurs existantes si non fournies
  const updatedName = data.name !== undefined ? data.name : uneditedTag.nom;
  const updatedType = data.type !== undefined ? data.type : uneditedTag.type;

  const tag = await prisma.tags.update({
    where: { id_tag: id_tag },
    data: {
      nom: updatedName,
      type: updatedType,
    },
  });
  return tag;
};

const createTag = async (data) => {
  const tag = await prisma.tags.create({
    data: {
      nom: data.name,
      type: data.type,
    },
  });
  return tag;
};

const deleteTag = async (id_tag) => {
  // Vérifier si le tag existe
  const tagExists = await getTagById(id_tag);
  if (!tagExists) {
    return null;
  }

  // Vérifier si le tag est utilisé avant suppression
  const isTagUsed = await isTagInUse(id_tag);
  if (isTagUsed) {
    throw new Error("TAG_IN_USE");
  }

  try {
    const tag = await prisma.tags.delete({
      where: { id_tag: id_tag },
    });
    return tag;
  } catch (error) {
    console.error("Erreur lors de la suppression du tag:", error);
    return null;
  }
};

// Fonction utilitaire pour vérifier si un tag est utilisé
const isTagInUse = async (id_tag) => {
  // Compter les utilisations dans différentes tables
  const alimentsTagsCount = await prisma.aliments_tags.count({
    where: { id_tag: id_tag },
  });

  const exercicesTagsCount = await prisma.exercices_tags.count({
    where: { id_tag: id_tag },
  });

  const programmesTagsCount = await prisma.programmes_tags.count({
    where: { id_tag: id_tag },
  });

  const seancesTagsCount = await prisma.seances_tags.count({
    where: { id_tag: id_tag },
  });

  // Retourner true si le tag est utilisé dans une des tables
  return (
    alimentsTagsCount +
      exercicesTagsCount +
      programmesTagsCount +
      seancesTagsCount >
    0
  );
};

// Fonction pour récupérer les statistiques d'utilisation d'un tag
const getTagUsageStats = async (id_tag) => {
  const aliments = await prisma.aliments_tags.count({
    where: { id_tag: id_tag },
  });

  const exercices = await prisma.exercices_tags.count({
    where: { id_tag: id_tag },
  });

  const programmes = await prisma.programmes_tags.count({
    where: { id_tag: id_tag },
  });

  const seances = await prisma.seances_tags.count({
    where: { id_tag: id_tag },
  });

  const total = aliments + exercices + programmes + seances;

  return {
    aliments,
    exercices,
    programmes,
    seances,
    total,
  };
};

module.exports = {
  getTagById,
  getAllTags,
  getTagCountByType,
  updateTag,
  createTag,
  deleteTag,
  getTagUsageStats,
};
