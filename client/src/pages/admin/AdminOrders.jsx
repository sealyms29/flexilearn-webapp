import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminOrders.scss";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const fetchOrders = async () => {
    try {
      const res = await newRequest.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const filterOrders = () => {
    if (!searchTerm) {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter(
          (order) =>
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.title && order.title.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "completed";
      case "pending":
        return "pending";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  return (
    <AdminLayout>
      <div className="admin-orders">
        <div className="orders-header">
          <h2>Orders Management</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Order ID or Service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="orders-container">
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">{order._id?.slice(-8)}</td>
                      <td className="service">{order.title || "N/A"}</td>
                      <td className="buyer">{order.buyerName || "N/A"}</td>
                      <td className="seller">{order.sellerName || "N/A"}</td>
                      <td className="price">RM {order.price || 0}</td>
                      <td>
                        <span className={`status ${getStatusColor(order.status)}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      {searchTerm ? "No orders found" : "No orders yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="orders-summary">
          <p>Total Orders: <strong>{orders.length}</strong></p>
          <p>Showing: <strong>{filteredOrders.length}</strong></p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;