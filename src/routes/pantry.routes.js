import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  addPantryItem,
  getPantry,
  deletePantryItem,
  scanPantry,
  savePantryItems,
  updatePantryItem,
} from "../controllers/pantry.controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", verifyUser, addPantryItem);
router.get("/", verifyUser, getPantry);
router.delete("/", verifyUser, deletePantryItem);
router.post("/scan", verifyUser, upload.single("image"), scanPantry);
router.post("/save", verifyUser, savePantryItems);
router.put("/:id", verifyUser, updatePantryItem);

export default router;
