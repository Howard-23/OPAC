const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { signToken } = require("../utils/jwt");

async function login(req, res) {
  const { username, password } = req.body;

  const user = await User.findOne({
    where: { username }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = signToken({
    sub: user.id,
    username: user.username,
    role: user.role
  });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}

async function me(req, res) {
  const user = await User.findByPk(req.user.sub, {
    attributes: ["id", "username", "role"]
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
}

module.exports = {
  login,
  me
};
