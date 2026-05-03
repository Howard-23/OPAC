const { Router } = require("express");
const {
  createBook,
  deleteBook,
  getBook,
  listBooks,
  lookupBookByIsbn,
  updateBook
} = require("../controllers/books.controller");

const router = Router();

router.get("/", (req, res, next) => listBooks(req, res).catch(next));
router.get("/google/:isbn", (req, res, next) => lookupBookByIsbn(req, res).catch(next));
router.get("/:id", (req, res, next) => getBook(req, res).catch(next));
router.post("/", (req, res, next) => createBook(req, res).catch(next));
router.put("/:id", (req, res, next) => updateBook(req, res).catch(next));
router.delete("/:id", (req, res, next) => deleteBook(req, res).catch(next));

module.exports = router;
