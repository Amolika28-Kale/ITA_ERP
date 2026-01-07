const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  const { name, email, role, teamId } = req.body;
  const password = await bcrypt.hash("user123", 10);

  const user = await User.create({
    name,
    email,
    password,
    role,
    teamId
  });

  res.status(201).json(user);
};

exports.getUsers = async (req, res) => {
  const users = await User.find().populate("teamId", "name");
  res.json(users);
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
};

exports.disableUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  res.json(user);
};
