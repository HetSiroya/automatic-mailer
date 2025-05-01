import express, { Request, Response, NextFunction } from "express";
import { auth } from "../middlewares/token-decode";
import { send } from "../controllers/mailerControler";
const router = express.Router();

router.post("/send", auth, async (req, res, next) => {
  try {
    await send(req, res);
  } catch (e) {
    next();
  }
});

export default router
