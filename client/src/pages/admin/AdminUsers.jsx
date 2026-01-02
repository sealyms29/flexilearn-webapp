import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminUsers.scss";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Admin protection check
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user?.isAdmin) {
      navigate("/admin/login");
      return;
    }

    // Fetch users data
    newRequest.get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate("/admin/login");
        }
      });
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filterType]);

  const applyFilters = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === "buyers") {
      filtered = filtered.filter((user) => user.isStudent);
    } else if (filterType === "sellers") {
      filtered = filtered.filter((user) => user.isSeller);
    }

    setFilteredUsers(filtered);
  };

  const stats = {
    totalUsers: users.length,
    buyers: users.filter((u) => u.isStudent).length,
    sellers: users.filter((u) => u.isSeller).length,
  };

  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="users-header">
          <h2>Member Accounts</h2>
          <div className="users-controls">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="buyers">Buyers</option>
              <option value="sellers">Sellers</option>
            </select>
          </div>
        </div>

        {/* User Stats */}
        <div className="user-stats">
          <div className="stat-card">
            <p className="stat-label">Total Members</p>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Buyers</p>
            <p className="stat-value">{stats.buyers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Sellers</p>
            <p className="stat-value">{stats.sellers}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-container">
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="username">
                        <strong>{user.username}</strong>
                      </td>
                      <td className="email">{user.email}</td>
                      <td>
                        <span className={`badge ${user.isStudent ? "active" : ""}`}>
                          {user.isStudent ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.isSeller ? "active" : ""}`}>
                          {user.isSeller ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.verified ? "verified" : "pending"}`}>
                          {user.verified ? "✓ Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="date">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      {searchTerm ? "No users found" : "No users yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="users-summary">
          <p>Showing: <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> members</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;