const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(path.resolve(__dirname, "..", "..", "config", "database.cjs"))[env];

const db = {};
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const basename = path.basename(__filename);

for (const file of fs.readdirSync(__dirname)) {
  if (file === basename || !file.endsWith(".js")) {
    continue;
  }

  const model = require(path.join(__dirname, file))(sequelize, DataTypes);
  db[model.name] = model;
}

for (const modelName of Object.keys(db)) {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
