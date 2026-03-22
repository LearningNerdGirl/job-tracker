import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './applications.controller';

const router = Router();
router.use(authenticate as any);

router.get('/', ctrl.getAll as any);
router.get('/suggestions', ctrl.getSuggestions as any);
router.post('/', ctrl.create as any);
router.get('/:id', ctrl.getOne as any);
router.put('/:id', ctrl.update as any);
router.patch('/:id/status', ctrl.updateStatus as any);
router.delete('/:id', ctrl.remove as any);

export default router;
