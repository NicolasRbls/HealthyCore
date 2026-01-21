const express = require('express');
const syncController = require('./sync.controller');
const { checkAuth } = require('../../modules/auth/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/sync:
 *   post:
 *     summary: Synchronize data (Offline Mode)
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastSync:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp of the last successful sync (ISO 8601)
 *               push:
 *                 type: object
 *                 description: Data to push to server (optional)
 *     responses:
 *       200:
 *         description: Sync successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     pull:
 *                       type: object
 *                       description: Updated data from server
 */
router.post('/', checkAuth, syncController.syncData);

module.exports = router;
