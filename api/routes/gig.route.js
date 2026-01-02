import express from "express";
import {
  createGig,
  deleteGig,
  updateGig,
  getGig,
  getGigs,
  seedGigs
} from "../controllers/gig.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

router.post("/seed", seedGigs);
router.post("/", verifyToken, createGig);
router.delete("/:id", verifyToken, verifyAdmin, deleteGig);
router.put("/:id", verifyToken, verifyAdmin, updateGig);
router.get("/single/:id", getGig);
router.get("/", getGigs);

export default router;
