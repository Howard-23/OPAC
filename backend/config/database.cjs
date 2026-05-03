require("dotenv").config();

const shared = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  migrationStorage: "sequelize",
  seederStorage: "sequelize"
};

module.exports = {
  development: shared,
  test: shared,
  production: shared
};

