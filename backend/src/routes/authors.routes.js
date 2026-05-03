const { Router } = require("express");
const {
  createAuthor,
  deleteAuthor,
  getAuthor,
  listAuthors,
  updateAuthor
} = require("../controllers/authors.controller");

const router = Router();

router.get("/", (req, res, next) => listAuthors(req, res).catch(next));
router.get("/:id", (req, res, next) => getAuthor(req, res).catch(next));
router.post("/", (req, res, next) => createAuthor(req, res).catch(next));
router.put("/:id", (req, res, next) => updateAuthor(req, res).catch(next));
router.delete("/:id", (req, res, next) => deleteAuthor(req, res).catch(next));

module.exports = router;
