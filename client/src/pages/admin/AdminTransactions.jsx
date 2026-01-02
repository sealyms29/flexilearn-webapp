import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminTransactions.scss";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("monthly");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filterType, dateRange]);

  const getStatus = (t) => {
    if (t?.status) return String(t.status).toLowerCase();
    if (typeof t?.isCompleted !== "undefined") return t.isCompleted ? "completed" : "pending";
    if (typeof t?.isCancelled !== "undefined") return t.isCancelled ? "cancelled" : "pending";
    return "pending";
  };

  const fetchTransactions = async () => {
    try {
      const res = await newRequest.get("/admin/orders");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "daily":
        startDate.setDate(now.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return null;
    }
    return startDate;
  };

  const applyFilters = () => {
    let filtered = transactions;

    // Filter by date range
    if (dateRange !== "all") {
      const startDate = getDateRange();
      filtered = filtered.filter(
        (t) => new Date(t.createdAt) >= startDate
      );
    }

    // Filter by status (derive status from isCompleted when missing)
    if (filterType !== "all") {
      filtered = filtered.filter((t) => getStatus(t) === filterType.toLowerCase());
    }

    setFilteredTransactions(filtered);
  };

  const calculateStats = () => {
    const total = filteredTransactions.length;
    const revenue = filteredTransactions.reduce(
      (sum, t) => sum + (parseFloat(t.price) || 0),
      0
    );
    const completed = filteredTransactions.filter(
      (t) => t.status?.toLowerCase() === "completed"
    ).length;
    const pending = filteredTransactions.filter(
      (t) => t.status?.toLowerCase() === "pending"
    ).length;

    return { total, revenue, completed, pending };
  };

  const stats = calculateStats();

  return (
    <AdminLayout>
      <div className="admin-transactions">
        <div className="transactions-header">
          <h2>Transaction History</h2>
          <div className="filter-controls">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="transaction-stats">
          <div className="stat-box">
            <p className="stat-label">Total Transactions</p>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-box highlight">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">RM {stats.revenue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Completed</p>
            <p className="stat-value" style={{ color: "#4caf50" }}>
              {stats.completed}
            </p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Pending</p>
            <p className="stat-value" style={{ color: "#f57c00" }}>
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="transactions-container">
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Service</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="tx-id">{transaction._id?.slice(-8)}</td>
                      <td>{transaction.title || "N/A"}</td>
                      <td>{transaction.buyerName || "N/A"}</td>
                      <td>{transaction.sellerName || "N/A"}</td>
                      <td className="amount">
                        RM {parseFloat(transaction.price || 0).toFixed(2)}
                      </td>
                      <td>
                        {(() => {
                          const s = transaction.status || (transaction.isCompleted ? "Completed" : "Pending");
                          return (
                            <span className={`status ${String(s).toLowerCase()}`}>
                              {s}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="date">
                        {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                        {new Date(transaction.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No transactions found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;
