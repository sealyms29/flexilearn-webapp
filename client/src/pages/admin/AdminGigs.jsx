import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";
import AdminLayout from "../../components/adminLayout/AdminLayout";
import "./AdminGigs.scss";

const AdminGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    desc: "",
    cover: "",
  });

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const res = await newRequest.get("/admin/gigs");
      setGigs(res.data);
    } catch (err) {
      console.error("Failed to fetch gigs:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    try {
      // use admin delete endpoint so admin can delete any service
      await newRequest.delete(`/admin/gigs/${id}`);
      setGigs(gigs.filter((g) => g._id !== id));
      alert("Service deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete service");
    }
  };

  const handleEdit = (gig) => {
    setFormData({
      title: gig.title,
      price: gig.price,
      desc: gig.desc,
      cover: gig.cover,
    });
    setEditingId(gig._id);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await newRequest.put(`/gigs/${editingId}`, formData);
        alert("Service updated successfully");
      } else {
        const currentUser = getCurrentUser();
        // if admin, use admin create endpoint which does not require seller role
        const endpoint = currentUser?.isAdmin ? "/admin/gigs" : "/gigs";
        const res = await newRequest.post(endpoint, formData);
        if (res?.status === 201 || res?.status === 200) alert("Service created successfully");
      }
      fetchGigs();
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: "", price: "", desc: "", cover: "" });
    } catch (error) {
      console.error("Failed to save service:", error);
      const msg = error?.response?.data?.message || error?.response?.data || "Failed to save service";
      alert(msg);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-gigs">
        <div className="gigs-header">
          <h2>Manage Services</h2>
          <button
            className="btn-primary"
            onClick={() => {
              // when opening the form for creating a new service,
              // clear any existing editing state so it will create, not update
              if (!showForm) {
                setEditingId(null);
                setFormData({ title: "", price: "", desc: "", cover: "" });
              }
              // when closing (Cancel), also clear the form
              if (showForm) {
                setEditingId(null);
                setFormData({ title: "", price: "", desc: "", cover: "" });
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "+ Add Service"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <form onSubmit={handleSubmit} className="gig-form">
              <div className="form-group">
                <label>Service Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Web Development"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (RM)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleFormChange}
                  placeholder="Describe your service..."
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Cover Image URL</label>
                <input
                  type="text"
                  name="cover"
                  value={formData.cover}
                  onChange={handleFormChange}
                  placeholder="https://..."
                />
              </div>

              <button type="submit" className="btn-submit">
                {editingId ? "Update Service" : "Create Service"}
              </button>
            </form>
          </div>
        )}

        <div className="gigs-container">
          <div className="table-wrapper">
            <table className="gigs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Seller</th>
                  <th>Seller ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gigs.length > 0 ? (
                  gigs.map((gig) => (
                    <tr key={gig._id}>
                      <td className="title">{gig.title}</td>
                      <td className="price">RM {gig.price}</td>
                      <td className="desc">{gig.desc?.substring(0, 50)}...</td>
                      <td className="seller">{gig.sellerName || gig.userId}</td>
                      <td className="seller-id">{gig.userId}</td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(gig)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(gig._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No services found
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

export default AdminGigs;