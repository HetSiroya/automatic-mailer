import express from "express";
const router = express.Router();
import auth from "./authRoutes";
import mailsend from "./mailRoutes";
import { send } from "../controllers/mailerControler";
router.get("/", (req, res) => {
  res.send("done");
});

router.use("/auth", auth);
router.use("/send-mail" , mailsend);

export default router;
