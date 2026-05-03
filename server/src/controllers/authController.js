const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../config/database");
const httpError = require("../utils/httpError");

function buildAuthResponse(user) {
  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw httpError(400, "Username and password are required.");
  }

  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw httpError(401, "Invalid username or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw httpError(401, "Invalid username or password.");
  }

  res.json(buildAuthResponse(user));
}

async function me(req, res) {
  res.json({
    user: req.user
  });
}

module.exports = {
  login,
  me
};
