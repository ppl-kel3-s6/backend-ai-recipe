import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  addPantryItem,
  getPantry,
  deletePantryItem,
  scanPantry,
} from "../controllers/pantry.controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", verifyUser, addPantryItem);
router.get("/", verifyUser, getPantry);
router.delete("/", verifyUser, deletePantryItem);
router.post("/scan", verifyUser, scanPantry);
router.post("/scan", verifyUser, upload.single("image"), scanPantry);

export default router;
