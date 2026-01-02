import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Admin protection check
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.isAdmin) {
      console.warn("⚠️ Unauthorized access attempt to admin dashboard");
      navigate("/admin/login");
      return;
    }

    // Fetch admin stats
    newRequest.get("/admin/summary")
      .then((res) => {
        setStats({
          totalUsers: res.data.totalUsers || 0,
          totalServices: res.data.totalServices || 0,
          totalOrders: res.data.totalOrders || 0,
          totalRevenue: res.data.totalRevenue || 0,
        });
        setRecentOrders(res.data.recentOrders || []);
      })
      .catch((err) => {
        console.error("Failed to fetch admin summary:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate("/admin/login");
        }
      });
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">👥</div>
            <div className="stat-content">
              <p className="stat-label">Total Members</p>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon services">🎯</div>
            <div className="stat-content">
              <p className="stat-label">Total Services</p>
              <p className="stat-value">{stats.totalServices}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">📦</div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value">RM {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="recent-section">
          <h2>Recent Orders</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service</th>
                  <th>Buyer</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">{order._id?.slice(-8)}</td>
                      <td>{order.title}</td>
                      <td>{order.buyerName || "N/A"}</td>
                      <td>RM {order.price}</td>
                      <td>
                        <span className={`status ${order.status?.toLowerCase() || "pending"}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No recent orders
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

export default AdminDashboard;