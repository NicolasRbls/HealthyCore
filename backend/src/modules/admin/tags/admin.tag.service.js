const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getTagById = async (id_tag) => {
    const tag = await prisma.tags.findUnique({
        where: {
            id_tag: id_tag
        },
        select: {
            id_tag: true,
            nom: true,
            type: true,
        }
    });
    return tag;
}

const getTagCountByType = async (type) => {
    const count = await prisma.tags.count({
        where: {
            ...(type && { type: type }),
        }
    });
    return count;
}

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
            id_tag: 'asc'
        }
    });
    return tags;
}

const updateTag = async (id_tag, data) => {
    uneditedTag = await getTagById(id_tag);
    data.name = data.name || uneditedTag.nom;
    data.type = data.type || uneditedTag.type;

    const tag = await prisma.tags.update({
        where: { id_tag: id_tag },
        data: {
            nom: data.name,
            type: data.type,
        }
    });
    return tag;
}

const createTag = async (data) => {
    const tag = await prisma.tags.create({
        data: {
            nom: data.name,
            type: data.type,
        }
    });
    return tag;
}

const deleteTag = async (id_tag) => {
    const tag = await prisma.tags.delete({
        where: { id_tag: id_tag }
    });
    return tag;
}

module.exports = {
    getTagById,
    getAllTags,
    getTagCountByType,
    updateTag,
    createTag,
    deleteTag
}