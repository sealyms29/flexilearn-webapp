import express from "express";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import { verifyToken } from "../middleware/jwt.js";
import { verifyAdmin } from "../middleware/admin.js";
import { createGigAdmin } from "../controllers/gig.controller.js";

const router = express.Router();

/**
 * ADMIN: View all users*/
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

/**
 * ADMIN: View orders (with optional filter)*/
router.get("/orders", verifyToken, verifyAdmin, async (req, res) => {
  const filter = req.query.filter;
  let date = new Date(0); // default: all time

  if (filter === "daily") {
    date = new Date();
    date.setDate(date.getDate() - 1);
  }
  if (filter === "weekly") {
    date = new Date();
    date.setDate(date.getDate() - 7);
  }
  if (filter === "monthly") {
    date = new Date();
    date.setMonth(date.getMonth() - 1);
  }

  const orders = await Order.find({
    createdAt: { $gte: date },
  }).sort({ createdAt: -1 });

  res.status(200).json(orders);
});

/**
 * ADMIN: Transaction summary*/
router.get("/summary", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    const totalOrders = orders.length;
    const totalUsers = await User.countDocuments();
    const totalServices = await Gig.countDocuments();

    // recent orders (limit 5)
    const recentOrders = orders.slice(0, 5);

    res.status(200).json({
      totalUsers,
      totalServices,
      totalOrders,
      totalRevenue,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: View all services*/
router.get("/gigs", verifyToken, verifyAdmin, async (req, res) => {
  const gigs = await Gig.find();
  res.status(200).json(gigs);
});

/**
 * ADMIN: Create a service (admins can create without seller role)
 */
router.post("/gigs", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    // delegate to controller function
    await createGigAdmin(req, res, next);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: Delete service*/
router.delete("/gigs/:id", verifyToken, verifyAdmin, async (req, res) => {
  await Gig.findByIdAndDelete(req.params.id);
  res.status(200).json("Service deleted");
});

export default router;