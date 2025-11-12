// src/controllers/insuranceController.js

const applications = [];
const policies = [];
const claims = [];
const payments = [];

export const createApplication = (req, res) => {
  const application = { id: Date.now().toString(), status: "pending", ...req.body };
  applications.push(application);
  res.status(201).json(application);
};

export const getUserApplications = (req, res) => {
  const { userId } = req.query;
  const userApps = applications.filter(app => app.userId === userId);
  res.json(userApps);
};

export const getUserPolicies = (req, res) => {
  const { userId } = req.query;
  const userPolicies = policies.filter(p => p.userId === userId);
  res.json(userPolicies);
};

export const submitClaim = (req, res) => {
  const claim = { id: Date.now().toString(), status: "submitted", ...req.body };
  claims.push(claim);
  res.status(201).json(claim);
};

export const getUserClaims = (req, res) => {
  const { userId } = req.query;
  const userClaims = claims.filter(c => c.userId === userId);
  res.json(userClaims);
};

export const recordPayment = (req, res) => {
  const payment = { id: Date.now().toString(), ...req.body };
  payments.push(payment);
  res.status(201).json(payment);
};
