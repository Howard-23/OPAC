const express = require("express");

const bookController = require("../controllers/bookController");
const { requireAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth);
router.get("/", asyncHandler(bookController.listBooks));
router.get("/lookup/:isbn", asyncHandler(bookController.lookupBookByIsbn));
router.get("/:id", asyncHandler(bookController.getBook));
router.post("/", asyncHandler(bookController.createBook));
router.put("/:id", asyncHandler(bookController.updateBook));
router.delete("/:id", asyncHandler(bookController.deleteBook));

module.exports = router;
