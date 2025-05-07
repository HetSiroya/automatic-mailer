import express, { Request, Response, NextFunction } from "express";
import { auth } from "../middlewares/token-decode";
import {
  checkAndSendScheduledEmails,
  send,
} from "../controllers/mailerControler";
import { upload } from "../config/multerConfig";

const router = express.Router();

// Add body-parser middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/send", auth, upload.array('attachemnets'), async (req, res, next) => {
  try {
    await send(req, res);
  } catch (e) {
    next(e);
  }
});

router.get("/check-scheduled-emails", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkAndSendScheduledEmails(req, res);
  } catch (e) {
    next();
  }
});export default router;
