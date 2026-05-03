const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { env } = require("./config/env");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);
app.use(errorHandler);

module.exports = { app };
