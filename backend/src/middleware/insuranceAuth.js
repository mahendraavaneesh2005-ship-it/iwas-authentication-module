// Example simple middleware that checks for user auth token

module.exports = function insuranceAuth(req, res, next) {
  // Add your token/session validation here
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};
