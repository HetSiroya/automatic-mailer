require("dotenv").config();
import express from "express";
import connetDB from "./config/db.config";
import index from "./routes/indexRoute";
import path from "path";

const app = express();
const Port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use("/", index);

// Start scheduler and server
import { startEmailScheduler } from "./controllers/mailerControler";
startEmailScheduler();

app.listen(Port, () => {
  console.log(`http://localhost:${Port}/`);
});

connetDB();

export default app;
