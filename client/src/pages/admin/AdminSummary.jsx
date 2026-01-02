import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import { jsPDF } from "jspdf";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminSummary.scss";

const AdminSummary = () => {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  const getFilteredTransactions = () => {
    if (dateRange === "all") return transactions;
    const startDate = getDateRange();
    return transactions.filter((t) => new Date(t.createdAt) >= startDate);
  };

  const getStatus = (t) => {
    if (t?.status) return String(t.status).toLowerCase();
    if (typeof t?.isCompleted !== "undefined") return t.isCompleted ? "completed" : "pending";
    if (typeof t?.isCancelled !== "undefined") return t.isCancelled ? "cancelled" : "pending";
    return "pending";
  };

  const generateReport = () => {
    const filtered = getFilteredTransactions();
    const totalRevenue = filtered.reduce(
      (sum, t) => sum + (parseFloat(t.price) || 0),
      0
    );
    const totalTransactions = filtered.length;
    const completed = filtered.filter((t) => getStatus(t) === "completed").length;
    const pending = filtered.filter((t) => getStatus(t) === "pending").length;
    const cancelled = filtered.filter((t) => getStatus(t) === "cancelled").length;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalTransactions,
      completed,
      pending,
      cancelled,
      averageTransaction: (totalRevenue / totalTransactions || 0).toFixed(2),
      conversionRate: (
        (completed / totalTransactions) * 100 ||
        0
      ).toFixed(2),
    };
  };

  const exportToPDF = () => {
    const report = generateReport();
    const filtered = getFilteredTransactions();
    // Generate a simple PDF using jsPDF
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      let y = 40;
      doc.setFontSize(16);
      doc.text("Transaction Report", 40, y);
      doc.setFontSize(10);
      y += 20;
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, y);
      y += 14;
      doc.text(`Period: ${dateRange.toUpperCase()}`, 40, y);
      y += 20;

      doc.setFontSize(12);
      doc.text("Summary Statistics:", 40, y);
      y += 14;
      const lines = [
        `Total Revenue: RM ${report.totalRevenue}`,
        `Total Transactions: ${report.totalTransactions}`,
        `Completed Orders: ${report.completed}`,
        `Pending Orders: ${report.pending}`,
        `Cancelled Orders: ${report.cancelled}`,
        `Average Transaction: RM ${report.averageTransaction}`,
        `Conversion Rate: ${report.conversionRate}%`,
      ];

      lines.forEach((ln) => {
        doc.text(ln, 60, y);
        y += 14;
      });

      y += 10;
      doc.text("Detailed Transactions:", 40, y);
      y += 16;

      filtered.forEach((t) => {
        const statusLabel = (t.status) ? t.status : (t.isCompleted ? "Completed" : "Pending");
        const line = `ID:${t._id?.slice(-8)} | ${t.title} | RM ${parseFloat(t.price || 0).toFixed(2)} | ${statusLabel} | ${new Date(t.createdAt).toLocaleDateString()}`;
        // wrap long lines manually
        const split = doc.splitTextToSize(line, 500);
        split.forEach((s) => {
          if (y > 760) {
            doc.addPage();
            y = 40;
          }
          doc.text(s, 60, y);
          y += 12;
        });
        y += 6;
      });

      const filename = `transaction-report-${dateRange}-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
      alert("PDF exported successfully!");
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF. Check console for details.");
    }
  };

  const exportToScreen = () => {
    const report = generateReport();
    const filtered = getFilteredTransactions();
    
    // Create a new window with the report
    const reportWindow = window.open("", "Report", "width=900,height=700");
    reportWindow.document.write(`
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              padding: 30px;
              background: #f5f5f5;
            }
            h1 { color: #2c3e50; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .summary-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .summary-label { font-size: 12px; color: #999; text-transform: uppercase; }
            .summary-value { font-size: 24px; font-weight: 700; color: #667eea; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; background: white; margin-top: 30px; }
            th { background: #667eea; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            tr:hover { background: #f9f9f9; }
            .print-btn { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 20px 0; }
            .print-btn:hover { background: #764ba2; }
          </style>
        </head>
        <body>
          <h1>Transaction Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Period: <strong>${dateRange.toUpperCase()}</strong></p>
          
          <div class="summary">
            <div class="summary-box">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-value">RM ${report.totalRevenue}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Total Transactions</div>
              <div class="summary-value">${report.totalTransactions}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Conversion Rate</div>
              <div class="summary-value">${report.conversionRate}%</div>
            </div>
          </div>

          <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>

          <h2>Summary Statistics</h2>
          <table>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
            <tr><td>Completed Orders</td><td>${report.completed}</td></tr>
            <tr><td>Pending Orders</td><td>${report.pending}</td></tr>
            <tr><td>Cancelled Orders</td><td>${report.cancelled}</td></tr>
            <tr><td>Average Transaction</td><td>RM ${report.averageTransaction}</td></tr>
          </table>

          <h2>Detailed Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (t) => `
                <tr>
                  <td>${t._id?.slice(-8)}</td>
                  <td>${t.title}</td>
                  <td>RM ${parseFloat(t.price || 0).toFixed(2)}</td>
                  <td><strong>${t.status || (t.isCompleted ? 'Completed' : 'Pending')}</strong></td>
                  <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const report = generateReport();
  const filtered = getFilteredTransactions();

  return (
    <AdminLayout>
      <div className="admin-summary">
        <div className="summary-header">
          <h2>Transaction Summary & Reports</h2>
          <div className="report-controls">
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

            <button className="btn-export" onClick={exportToScreen}>
              📋 View Report
            </button>
            <button className="btn-export download" onClick={exportToPDF}>
              💾 Download
            </button>
          </div>
        </div>

        {/* Report Summary Cards */}
        <div className="report-summary">
          <div className="summary-card main">
            <p className="summary-label">Total Revenue</p>
            <p className="summary-value">RM {report.totalRevenue}</p>
          </div>

          <div className="summary-card">
            <p className="summary-label">Total Transactions</p>
            <p className="summary-value">{report.totalTransactions}</p>
          </div>

          <div className="summary-card">
            <p className="summary-label">Completed</p>
            <p className="summary-value" style={{ color: "#4caf50" }}>
              {report.completed}
            </p>
          </div>

          <div className="summary-card">
            <p className="summary-label">Pending</p>
            <p className="summary-value" style={{ color: "#f57c00" }}>
              {report.pending}
            </p>
          </div>

          <div className="summary-card">
            <p className="summary-label">Cancelled</p>
            <p className="summary-value" style={{ color: "#f44336" }}>
              {report.cancelled}
            </p>
          </div>

          <div className="summary-card">
            <p className="summary-label">Avg Transaction</p>
            <p className="summary-value">RM {report.averageTransaction}</p>
          </div>

          <div className="summary-card">
            <p className="summary-label">Conversion Rate</p>
            <p className="summary-value">{report.conversionRate}%</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="breakdown-section">
          <h3>Detailed Transaction Breakdown</h3>
          <div className="table-wrapper">
            <table className="summary-table">
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
                {filtered.length > 0 ? (
                  filtered.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="tx-id">{transaction._id?.slice(-8)}</td>
                      <td>{transaction.title}</td>
                      <td>{transaction.buyerName}</td>
                      <td>{transaction.sellerName}</td>
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
                      <td>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No transactions found
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

export default AdminSummary;
