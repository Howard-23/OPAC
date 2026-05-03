const express = require("express");

const rentalController = require("../controllers/rentalController");
const { requireAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth);
router.get("/", asyncHandler(rentalController.listRentals));
router.get("/summary", asyncHandler(rentalController.rentalSummary));
router.get("/:id", asyncHandler(rentalController.getRental));
router.post("/", asyncHandler(rentalController.createRental));
router.put("/:id", asyncHandler(rentalController.updateRental));
router.post("/:id/return", asyncHandler(rentalController.returnRental));
router.delete("/:id", asyncHandler(rentalController.deleteRental));

module.exports = router;
