const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthInsuranceController');
const healthAuth = require('../middleware/healthauth');

router.post('/applications', healthAuth, healthController.createApplication);
router.patch('/applications/:id', healthAuth, healthController.updateApplication);
router.get('/plans', healthController.getPlans);
router.post('/payments', healthAuth, healthController.processPayment);
router.get('/claims/history', healthAuth, healthController.getClaimsHistory);
router.post('/claims', healthAuth, healthController.submitClaim);
router.get('/policies', healthAuth, healthController.getPolicies);
router.post('/policies/:id/renew', healthAuth, healthController.renewPolicy);

module.exports = router;
