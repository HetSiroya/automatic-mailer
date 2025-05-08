import express, { Request, Response, NextFunction } from "express";
import { login, signUp } from "../controllers/authControler";
const router = express.Router();

router.post("/sign-up", async (req, res, next) => {
  try {
    await signUp(req, res, next);
  } catch (e) {
    next();
  }
});

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await login(req, res);
    } catch (e) {
      next();
    }
  }
);

export default router;
