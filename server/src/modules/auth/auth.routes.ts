import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register', ctrl.register as any);
router.post('/login', ctrl.login as any);
router.post('/refresh', ctrl.refresh as any);
router.get('/me', authenticate as any, ctrl.getMe as any);

export default router;
