const { Router } = require("express");
const { z } = require("zod");
const { login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    z.object({
      username: z.string().trim().min(1),
      password: z.string().min(1)
    }).parse(req.body);

    await login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    await me(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
