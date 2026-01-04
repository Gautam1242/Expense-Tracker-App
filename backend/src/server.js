import express from "express";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionRoute from "./routes/transactionsRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import userRoute from "./routes/userRoute.js";
import { initDB } from "./config/db.js";
import job from "./config/cron.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

if (process.env.NODE_ENV === "production") job.start();

// middleware
app.use(rateLimiter);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use("/api", transactionRoute);
app.use("/api", notificationRoute);
app.use("/api", userRoute);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
  });
});
