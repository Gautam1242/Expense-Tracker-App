import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB", error);
    process.exit(1); // status code 1 means failure , 0 means success
  }
}

const app = express();

app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("It is working fine...");
// });

app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        message: "User id is required",
      });
    }

    const transactions =
      await sql`SELECT * FROM transactions where user_id=${userId}`;
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.log("Error fetching the transactions", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction id is required",
      });
    }
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "Invalid Transaction Id",
      });
    }
    const response =
      await sql`DELETE FROM transactions where id=${id} RETURNING *`;

    if (response.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }
    res.status(200).json({
      message: "Transaction removed successfully",
    });
  } catch (error) {
    console.log("Error while deleting the transaction", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.post("/api/transaction", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const transaction =
      await sql`INSERT INTO transactions(user_id,title,amount,category) VALUES (${user_id},${title},${amount},${category}) RETURNING *`;

    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
  });
});
