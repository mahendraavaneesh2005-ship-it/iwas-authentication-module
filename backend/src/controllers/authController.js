import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken, setCookie, clearCookie } from "../utils/jwt.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  const token = signToken({ id: user._id });
  setCookie(res, token);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  const token = signToken({ id: user._id });
  setCookie(res, token);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

export const me = async (req, res) => res.json({ user: req.user });

export const logout = (req, res) => { clearCookie(res); res.json({ ok: true }); };

export const updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Not found" });
  if (name) user.name = name;
  if (email) user.email = email;
  if (currentPassword && newPassword) {
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Current password incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
  }
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};
