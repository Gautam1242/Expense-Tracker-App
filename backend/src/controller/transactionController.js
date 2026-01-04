import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
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
}

export async function deleteTransaction(req, res) {
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
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const transaction =
      await sql`INSERT INTO transactions(user_id,title,amount,category) VALUES (${user_id},${title},${amount},${category}) RETURNING *`;

    // Create notification
    await sql`
      INSERT INTO notifications (user_id, message, type) 
      VALUES (${user_id}, 'You have created a new transaction', 'transaction')
    `;

    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function transactionSummary(req, res) {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`
        SELECT COALESCE(SUM(amount),0) as balance FROM transactions where user_id = ${userId}
        `;

    const incomeResult = await sql`
        SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id=${userId} and amount>0`;
    const expenseResult = await sql`
        SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id=${userId} and amount<0`;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expenseResult[0].expenses,
    });
  } catch (error) {
    console.log("Error fetching the summary", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
