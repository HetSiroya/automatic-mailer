require("dotenv").config();
import express from "express";
import connetDB from "./config/db.config";
import index from "./routes/indexRoute";
const app = express();
const Port = process.env.PORT || 5000;
app.use(express.json());
import { startEmailScheduler } from "./controllers/mailerControler";

startEmailScheduler();
app.listen(Port, () => {
  console.log(`http://localhost:${Port}/`);
});
connetDB();
app.use("/", index);

export default app;
