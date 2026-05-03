const { Router } = require("express");
const {
  createRental,
  deleteRental,
  getRental,
  listRentals,
  returnRental,
  updateRental
} = require("../controllers/rentals.controller");

const router = Router();

router.get("/", (req, res, next) => listRentals(req, res).catch(next));
router.get("/:id", (req, res, next) => getRental(req, res).catch(next));
router.post("/", (req, res, next) => createRental(req, res).catch(next));
router.put("/:id", (req, res, next) => updateRental(req, res).catch(next));
router.post("/:id/return", (req, res, next) => returnRental(req, res).catch(next));
router.delete("/:id", (req, res, next) => deleteRental(req, res).catch(next));

module.exports = router;
