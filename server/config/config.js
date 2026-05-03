require("dotenv").config();

const baseConfig = {
  dialect: "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "library_information_system",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  migrationStorageTableName: "sequelize_meta"
};

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_NAME || "library_information_system_test"
  },
  production: baseConfig
};
