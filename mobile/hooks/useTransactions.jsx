import { useCallback, useState } from "react";
import axios from "axios";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";



export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });

  const [loading, setLoading] = useState(true);

  // useCallback is used for performance reasons , it will memoize the function
  const fetchTransactions = useCallback(async () => {
    try {
      console.log("Fetching transactions for user : ", userId);
      const response = await axios.get(`${API_URL}/transactions/${userId}`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
        console.log("Transactions : ", response);
      }
    } catch (error) {
      console.log("Error while fetching the transactions : ", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/transactions/summary/${userId}`
      );
      // Backend returns the summary object directly
      setSummary(response.data);
      console.log("Summary Response: ", response.data);
    } catch (error) {
      console.log("Error while fetching the transactions : ", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // can be run in parallel
      await Promise.all([fetchTransactions(), fetchSummary()]);

      // as fresher you will do
      //   await fetchSummary(); // let say it will take 2s then the below method will execute
      //   await fetchTransactions();
    } catch (error) {
      console.log("Error while fetching the transactions : ", error);
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.status === 200) {
        Alert.alert("Success", "Transaction deleted successfully");
        loadData();
      }
    } catch (error) {
      console.log("Error while deleting the transaction : ", error);
      Alert.alert("Error : ", error.message);
    }
  };

  return { transactions, summary, loading, loadData, deleteTransaction };
};
