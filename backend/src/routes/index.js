const { Router } = require("express");
const authRoutes = require("./auth.routes");
const authorsRoutes = require("./authors.routes");
const booksRoutes = require("./books.routes");
const dashboardRoutes = require("./dashboard.routes");
const rentalsRoutes = require("./rentals.routes");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/authors", requireAuth, authorsRoutes);
router.use("/books", requireAuth, booksRoutes);
router.use("/rentals", requireAuth, rentalsRoutes);

module.exports = router;
