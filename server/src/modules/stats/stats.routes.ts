import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './stats.controller';

const router = Router();
router.use(authenticate as any);

router.get('/summary', ctrl.getSummary as any);
router.get('/timeline', ctrl.getTimeline as any);
router.get('/followups', ctrl.getFollowUps as any);

export default router;
