const express = require("express");

const authorController = require("../controllers/authorController");
const { requireAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth);
router.get("/", asyncHandler(authorController.listAuthors));
router.get("/:id", asyncHandler(authorController.getAuthor));
router.post("/", asyncHandler(authorController.createAuthor));
router.put("/:id", asyncHandler(authorController.updateAuthor));
router.delete("/:id", asyncHandler(authorController.deleteAuthor));

module.exports = router;
