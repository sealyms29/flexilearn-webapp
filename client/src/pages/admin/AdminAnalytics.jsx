import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import newRequest from "../../utils/newRequest";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminAnalytics.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("monthly");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await newRequest.get("/admin/orders");
      const usersRes = await newRequest.get("/admin/users");
      setTransactions(ordersRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
      setLoading(false);
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
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return { startDate: new Date(0), endDate: now };
    }
    return { startDate, endDate: now };
  };

  const getFilteredTransactions = () => {
    const { startDate, endDate } = getDateRange();
    return transactions.filter(
      (t) =>
        new Date(t.createdAt) >= startDate && new Date(t.createdAt) <= endDate
    );
  };

  const generateReport = () => {
    const filtered = getFilteredTransactions();
    const totalRevenue = filtered.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalTransactions = filtered.length;
    const completed = filtered.filter((t) => t.isCompleted).length;
    const pending = filtered.filter((t) => !t.isCompleted).length;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalTransactions,
      completed,
      pending,
      averageTransaction: (totalRevenue / totalTransactions || 0).toFixed(2),
      conversionRate: ((completed / totalTransactions) * 100 || 0).toFixed(2),
    };
  };

  const getChartData = () => {
    const filtered = getFilteredTransactions();
    const days = 7;
    const labels = [];
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      labels.push(dateStr);

      const dayTransactions = filtered.filter(
        (t) =>
          new Date(t.createdAt).toDateString() === date.toDateString()
      );
      const dayRevenue = dayTransactions.reduce(
        (sum, t) => sum + (t.price || 0),
        0
      );
      data.push(dayRevenue);
    }

    return { labels, data };
  };

  const getPaymentMethodData = () => {
    const filtered = getFilteredTransactions();
    const methodCounts = {
      card: filtered.filter((t) => t.paymentMethod === "card").length,
      fpx: filtered.filter((t) => t.paymentMethod === "fpx").length,
      other: filtered.filter(
        (t) => !["card", "fpx"].includes(t.paymentMethod)
      ).length,
    };

    return {
      labels: ["Card", "FPX", "Other"],
      data: [methodCounts.card, methodCounts.fpx, methodCounts.other],
      colors: ["#667eea", "#764ba2", "#f5a623"],
    };
  };

  const getStatusData = () => {
    const filtered = getFilteredTransactions();
    const statusCounts = {
      completed: filtered.filter((t) => t.isCompleted).length,
      pending: filtered.filter((t) => !t.isCompleted).length,
    };

    return {
      labels: ["Completed", "Pending"],
      data: [statusCounts.completed, statusCounts.pending],
      colors: ["#4caf50", "#ff9800"],
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-analytics">
          <div className="loading">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  const report = generateReport();
  const chartData = getChartData();
  const paymentData = getPaymentMethodData();
  const statusData = getStatusData();

  return (
    <AdminLayout>
      <div className="admin-analytics">
        <h1>Analytics Dashboard</h1>

        <div className="date-selector">
          <label>Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <h3>Total Revenue</h3>
            <p className="amount">RM {report.totalRevenue}</p>
          </div>
          <div className="card">
            <h3>Total Transactions</h3>
            <p className="count">{report.totalTransactions}</p>
          </div>
          <div className="card">
            <h3>Completed Orders</h3>
            <p className="count">{report.completed}</p>
          </div>
          <div className="card">
            <h3>Pending Orders</h3>
            <p className="count">{report.pending}</p>
          </div>
          <div className="card">
            <h3>Avg Transaction</h3>
            <p className="amount">RM {report.averageTransaction}</p>
          </div>
          <div className="card">
            <h3>Conversion Rate</h3>
            <p className="percentage">{report.conversionRate}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-box">
            <h3>Revenue Trend (Last 7 Days)</h3>
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: "Revenue (RM)",
                    data: chartData.data,
                    borderColor: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>

          <div className="chart-box">
            <h3>Payment Methods</h3>
            <Pie
              data={{
                labels: paymentData.labels,
                datasets: [
                  {
                    data: paymentData.data,
                    backgroundColor: paymentData.colors,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>

          <div className="chart-box">
            <h3>Order Status</h3>
            <Bar
              data={{
                labels: statusData.labels,
                datasets: [
                  {
                    label: "Count",
                    data: statusData.data,
                    backgroundColor: statusData.colors,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h3>Recent Transactions</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service</th>
                  <th>Amount (RM)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTransactions()
                  .slice(-10)
                  .reverse()
                  .map((t) => (
                    <tr key={t._id}>
                      <td>{t._id.substring(0, 8).toUpperCase()}</td>
                      <td>{t.title || "N/A"}</td>
                      <td>{(t.price || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status ${t.isCompleted ? "completed" : "pending"}`}>
                          {t.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
