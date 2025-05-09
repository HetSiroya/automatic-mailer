import express, { Request, Response, NextFunction } from "express";
import { login, signUp } from "../controllers/authControler";
import { uploadTo } from "../config/multerConfig";
import { auth } from "../middlewares/token-decode";

const router = express.Router();

router.post(
  "/sign-up",
  uploadTo("profiles").single("profilePicture"),
  async (req, res, next) => {
    try {
      await signUp(req, res, next);
    } catch (e) {
      next(e);
    }
  }
);


router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await login(req, res);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
