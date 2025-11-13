// src/controllers/insuranceController.js
import InsuranceApplication from "../models/InsuranceApplication.js";
import InsurancePolicy from "../models/InsurancePolicy.js";
import InsuranceClaim from "../models/InsuranceClaim.js";
import Payment from "../models/Payment.js";

export const createApplication = async (req, res) => {
  try {
    const payload = {
      userId: req.body.userId,
      vehicleType: req.body.vehicleType,
      vehicleMake: req.body.make || req.body.vehicleMake,
      vehicleModel: req.body.model || req.body.vehicleModel,
      vehicleYear: req.body.year || req.body.vehicleYear,
      vin: req.body.vin,
      licensePlate: req.body.licensePlate,
      color: req.body.color,
      mileage: req.body.mileage,
      driverName: req.body.driverName,
      driverLicense: req.body.driverLicense,
      driverAge: req.body.driverAge,
      driverExperience: req.body.driverExperience,
      coverageType: req.body.coverageType,
      coverageAmount: req.body.coverageAmount,
      deductible: req.body.deductible,
      status: "pending",
    };
    const doc = await InsuranceApplication.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    console.error("createApplication error", err);
    res.status(500).json({ message: "Failed to create application" });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.query;
    const docs = await InsuranceApplication.find({ userId }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("getUserApplications error", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const doc = await InsuranceApplication.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Application not found" });
    res.json(doc);
  } catch (err) {
    console.error("getApplicationById error", err);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

export const getUserPolicies = async (req, res) => {
  try {
    const { userId } = req.query;
    const docs = await InsurancePolicy.find({ userId }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("getUserPolicies error", err);
    res.status(500).json({ message: "Failed to fetch policies" });
  }
};

export const submitClaim = async (req, res) => {
  try {
    const payload = {
      userId: req.body.userId,
      policyId: req.body.policyId,
      incidentDescription: req.body.incidentDescription,
      incidentDate: req.body.incidentDate,
      status: "submitted",
    };
    const doc = await InsuranceClaim.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    console.error("submitClaim error", err);
    res.status(500).json({ message: "Failed to submit claim" });
  }
};

export const getUserClaims = async (req, res) => {
  try {
    const { userId } = req.query;
    const docs = await InsuranceClaim.find({ userId }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("getUserClaims error", err);
    res.status(500).json({ message: "Failed to fetch claims" });
  }
};

// If body contains applicationId, create a policy first, then record payment
export const recordPayment = async (req, res) => {
  try {
    let policyId = req.body.policyId;
    if (!policyId && req.body.applicationId) {
      const start = new Date();
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      const policy = await InsurancePolicy.create({
        userId: req.body.userId,
        applicationId: req.body.applicationId,
        policyNumber: req.body.policyNumber || `POL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        startDate: start,
        endDate: end,
        status: "active",
        coverageType: req.body.coverageType,
        coverageAmount: req.body.coverageAmount,
        deductible: req.body.deductible,
        premium: req.body.amount,
      });
      policyId = policy._id.toString();
      // Optionally update application status
      await InsuranceApplication.findByIdAndUpdate(req.body.applicationId, { status: "approved" });
    }

    const payment = await Payment.create({
      userId: req.body.userId,
      policyId,
      amount: req.body.amount,
      method: req.body.method || "credit_card",
      status: req.body.status || "completed",
      transactionId: req.body.transactionId || `TXN-${Date.now()}`,
      paidAt: req.body.paidAt || new Date(),
    });

    res.status(201).json({ payment, policyId });
  } catch (err) {
    console.error("recordPayment error", err);
    res.status(500).json({ message: "Failed to record payment" });
  }
};
