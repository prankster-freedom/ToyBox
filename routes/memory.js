import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { deleteUserData } from '../lib/store.js';
import { enter, exit, log } from '../lib/logger.js';

const router = express.Router();

router.delete('/', isAuthenticated, async (req, res) => {
    const functionName = 'DELETE /api/memory';
    enter(functionName, { userId: req.user.id });

    try {
        await deleteUserData(req.user.id);
        res.status(204).send();
        exit(functionName, { result: 'success' });
    } catch (error) {
        log('ERROR', functionName, error);
        res.status(500).json({ error: 'Failed to delete memory' });
    }
});

export default router;
