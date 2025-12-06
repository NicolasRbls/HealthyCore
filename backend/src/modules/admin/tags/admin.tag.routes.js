const express = require("express");
const adminTagController = require("./admin.tag.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminTag
 *   description: Admin tag management
 */

/**
 * @swagger
 * /api/admin/tag:
 *   get:
 *     summary: Get all tags
 *     tags: [AdminTag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tags
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/", checkAuth, isAdmin, adminTagController.getAllTags);

/**
 * @swagger
 * /api/admin/tag/{id_tag}:
 *   put:
 *     summary: Update a tag
 *     tags: [AdminTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_tag
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag_name
 *             properties:
 *               tag_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.put("/:id_tag", checkAuth, isAdmin, adminTagController.updateTag);

/**
 * @swagger
 * /api/admin/tag:
 *   post:
 *     summary: Create a new tag
 *     tags: [AdminTag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag_name
 *             properties:
 *               tag_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", checkAuth, isAdmin, adminTagController.createTag);

/**
 * @swagger
 * /api/admin/tag/{id_tag}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [AdminTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_tag
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete("/:id_tag", checkAuth, isAdmin, adminTagController.deleteTag);

/**
 * @swagger
 * /api/admin/tag/{id_tag}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [AdminTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_tag
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag details
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/:id_tag", checkAuth, isAdmin, adminTagController.getTagById);

module.exports = router;
