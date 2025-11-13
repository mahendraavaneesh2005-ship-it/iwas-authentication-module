import HealthApplication from '../models/HealthApplication.js';
import HealthPlan from '../models/HealthPlan.js';
import HealthPayment from '../models/HealthPayment.js';
import HealthClaim from '../models/HealthClaim.js';
import HealthPolicy from '../models/HealthPolicy.js';

// Example controller functions
export const createApplication = async (req, res) => {
  try {
    const app = new HealthApplication({...req.body});
    await app.save();
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const app = await HealthApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(app);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export const getPlans = async (req, res) => {
  try {
    const plans = await HealthPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export const getPolicies = async (req, res) => {
  try {
    const { userId } = req.query;
    const docs = await HealthPolicy.find(userId ? { userId } : {}).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitClaim = async (req, res) => {
  try {
    const payload = {
      userId: req.body.userId,
      policyId: req.body.policyId,
      claimNumber: req.body.claimNumber || `HCL-${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date(),
      hospitalName: req.body.hospitalName,
      diagnosis: req.body.diagnosis,
      treatmentDescription: req.body.treatmentDescription,
      claimAmount: req.body.claimAmount,
    };
    const doc = await HealthClaim.create(payload);
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClaimsHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    const docs = await HealthClaim.find(userId ? { userId } : {}).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { applicationId, userId, paymentAmount } = req.body;
    const paidAt = new Date();
    const payment = await HealthPayment.create({
      applicationId,
      userId,
      paymentMethod: req.body.paymentMethod || 'credit_card',
      paymentAmount,
      paymentStatus: 'completed',
      paidAt,
    });

    // Create or activate policy
    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    const policy = await HealthPolicy.create({
      userId,
      applicationId,
      planId: req.body.planId || null,
      policyNumber: `HPL-${Date.now()}`,
      monthlyPremium: req.body.monthlyPremium || 0,
      coverageAmount: req.body.coverageAmount || 0,
      startDate: start,
      endDate: end,
      status: 'active',
      paymentStatus: 'completed',
    });

    await HealthApplication.findByIdAndUpdate(applicationId, { status: 'approved' });

    res.status(201).json({ payment, policyId: policy._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const renewPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await HealthPolicy.findById(id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });

    const newEnd = policy.endDate ? new Date(policy.endDate) : new Date();
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    policy.endDate = newEnd;
    policy.status = 'active';
    policy.renewalDate = newEnd;
    await policy.save();

    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
