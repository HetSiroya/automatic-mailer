import express, { Request, Response, NextFunction } from "express";
import { auth } from "../middlewares/token-decode";
import {
  checkAndSendScheduledEmails,
  send,
} from "../controllers/mailerControler";
import { uploadTo } from "../config/multerConfig";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
  "/send",
  auth,
  uploadTo("fie").array("file", 5), 
  async (req, res, next) => {
    try {
      await send(req, res);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/check-scheduled-emails",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await checkAndSendScheduledEmails(req, res);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
