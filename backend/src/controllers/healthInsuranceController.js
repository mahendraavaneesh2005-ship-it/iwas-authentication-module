const HealthApplication = require('../models/HealthApplication');
const HealthPlan = require('../models/HealthPlan');
const HealthPayment = require('../models/HealthPayment');
const HealthClaim = require('../models/HealthClaim');
const HealthPolicy = require('../models/HealthPolicy');

// Example controller functions
exports.createApplication = async (req, res) => {
  try {
    const app = new HealthApplication({...req.body});
    await app.save();
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const app = await HealthApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(app);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await HealthPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// Add more controller functions similarly for payment, claims, policies, etc.
