import express from 'express';
import * as insuranceController from '../controllers/insuranceController.js';

const router = express.Router();

router.post('/applications', insuranceController.createApplication);
router.get('/applications', insuranceController.getUserApplications);
router.get('/applications/:id', insuranceController.getApplicationById);

router.get('/policies', insuranceController.getUserPolicies);

router.post('/claims', insuranceController.submitClaim);
router.get('/claims', insuranceController.getUserClaims);

router.post('/payments', insuranceController.recordPayment);

export default router;  // Default export for ES modules
