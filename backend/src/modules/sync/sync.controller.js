const syncService = require('./sync.service');
const { success, AppError } = require('../../utils/response.utils');

exports.syncData = async (req, res, next) => {
    try {
        const userId = req.user.id_user; // Assumes authMiddleware populates req.user
        const { lastSync, push } = req.body;

        if (!userId) {
            throw new AppError('User identifier missing', 400);
        }

        const result = await syncService.synchronize(userId, lastSync, push);

        res.status(200).json(
            success(result, 'Sync successful')
        );
    } catch (err) {
        next(err);
    }
};
