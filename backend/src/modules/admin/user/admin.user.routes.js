const express = require("express");
const adminUserController = require("./admin.user.controller");
const { isAdmin } = require("../../auth/auth.middleware");
const { checkAuth } = require("../../auth/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminUser
 *   description: Admin user management
 */

/**
 * @swagger
 * /api/admin/user/count:
 *   get:
 *     summary: Get total user count
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total user count
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/count", checkAuth, isAdmin, adminUserController.getTotalUserCount);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/", checkAuth, isAdmin, adminUserController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/:id", checkAuth, isAdmin, adminUserController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.delete("/:id", checkAuth, isAdmin, adminUserController.deleteUser);

module.exports = router;
