import express from "express";
const router = express.Router();
import auth from "./authRoutes";
import mailsend from "./mailRoutes";
import { send } from "../controllers/mailerControler";

router.get("/", (req, res) => {
  res.send("done");
});

// Mount routes with their respective paths
router.use("/auth", auth);
router.use("/send-mail", mailsend);

export default router;
