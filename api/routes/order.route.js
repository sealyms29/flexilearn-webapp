import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getOrders, intent, confirm, cleanupOrders } from "../controllers/order.controller.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// router.post("/:gigId", verifyToken, createOrder);
router.get("/", verifyToken, getOrders);
router.post("/create-payment-intent/:id", verifyToken, intent);
router.put("/", verifyToken, confirm);
router.delete("/cleanup/all", verifyToken, verifyAdmin, cleanupOrders); 

export default router;