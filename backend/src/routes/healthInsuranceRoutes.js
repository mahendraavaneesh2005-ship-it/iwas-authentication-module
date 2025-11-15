import express from 'express';
import * as healthController from '../controllers/healthInsuranceController.js';
import healthAuth from '../middleware/healthauth.js';

const router = express.Router();

router.post('/applications', healthAuth, healthController.createApplication);
router.patch('/applications/:id', healthAuth, healthController.updateApplication);
router.get('/plans', healthController.getPlans);
router.post('/payments', healthAuth, healthController.processPayment);
router.get('/claims/history', healthAuth, healthController.getClaimsHistory);
router.post('/claims', healthAuth, healthController.submitClaim);
router.get('/policies', healthController.getPolicies);
router.post('/policies/:id/renew', healthAuth, healthController.renewPolicy);

export default router;
