import User from "../models/User.js";
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
};
export const updateRole = async (req, res) => {
  const { role } = req.body;
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: "User not found" });
  u.role = role;
  await u.save();
  res.json({ user: u });
};
