const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const authorRoutes = require("./routes/authorRoutes");
const bookRoutes = require("./routes/bookRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandlers");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "library-information-system-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/rentals", rentalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
