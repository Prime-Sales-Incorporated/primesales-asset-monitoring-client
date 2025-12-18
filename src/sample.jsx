import React, { useEffect, useState } from "react";
import localforage from "localforage";

const TransactionsOffline = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAndStoreTransactions = async () => {
    try {
      // Step 1: Load IndexedDB first (instant offline display)
      const localData = await localforage.getItem("transactions");
      setTransactions(Array.isArray(localData) ? localData : []);

      // Step 2: Fetch fresh data from backend
      const response = await fetch(
        "http://localhost:5000/api/transactions/all"
      );
      const data = await response.json();

      const txArray = Array.isArray(data.transactions) ? data.transactions : [];
      await localforage.setItem("transactions", txArray);
      setTransactions(txArray); // update with latest
      console.log("Fetched from backend and stored locally");
    } catch (err) {
      console.log("Offline or fetch failed, using IndexedDB", err);
    } finally {
      setLoading(false); // always hide loading
    }
  };

  useEffect(() => {
    fetchAndStoreTransactions();
  }, []);

  return (
    <div>
      <h1>Transactions (Offline Ready)</h1>
      {loading && transactions.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx._id}</td>
                <td>{JSON.stringify(tx)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionsOffline;
