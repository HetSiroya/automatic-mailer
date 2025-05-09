require("dotenv").config();
import express from "express";
import connetDB from "./config/db.config";
import index from "./routes/indexRoute";
import path from "path";
import { startEmailScheduler } from "./controllers/mailerControler";
  
const app = express();
const Port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/", index);

startEmailScheduler();

app.listen(Port, () => {
  console.log(`http://localhost:${Port}/`);
});

connetDB();

export default app;
