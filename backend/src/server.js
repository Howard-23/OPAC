const { app } = require("./app");
const { env } = require("./config/env");
const { sequelize } = require("./models");

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connection established.");

    app.listen(env.port, () => {
      console.log(`Backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Unable to connect to PostgreSQL.", error);
    process.exit(1);
  }
}

startServer();
