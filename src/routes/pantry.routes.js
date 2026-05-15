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

/**
 * @swagger
 * /api/pantry:
 *   post:
 *     summary: Add pantry item
 *     tags: [Pantry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: telur
 *               quantity:
 *                 type: string
 *                 example: 2 pcs
 *     responses:
 *       200:
 *         description: Pantry item added
 */
router.post("/", verifyUser, addPantryItem);
/**
 * @swagger
 * /api/pantry:
 *   get:
 *     summary: Get user pantry
 *     tags: [Pantry]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pantry fetched successfully
 */
router.get("/", verifyUser, getPantry);
/**
 * @swagger
 * /api/pantry:
 *   delete:
 *     summary: Delete pantry item
 *     tags: [Pantry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 766315a3-30e8-4d9e-a826-955192f9b2c4
 *     responses:
 *       200:
 *         description: Pantry item deleted
 *       400:
 *         description: Failed to delete pantry item
 */
router.delete("/", verifyUser, deletePantryItem);

/**
 * @swagger
 * /api/pantry/scan:
 *   post:
 *     summary: Scan pantry image
 *     tags: [Pantry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Pantry image scanned successfully
 *       400:
 *         description: No image uploaded
 */
router.post("/scan", verifyUser, upload.single("image"), scanPantry);

/**
 * @swagger
 * /api/pantry/save:
 *   post:
 *     summary: Save scanned pantry items
 *     tags: [Pantry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["telur", "tomat"]
 *               image_url:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       200:
 *         description: Pantry items saved successfully
 */
router.post("/save", verifyUser, savePantryItems);

/**
 * @swagger
 * /api/pantry/{id}:
 *   put:
 *     summary: Update pantry item
 *     tags: [Pantry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 766315a3-30e8-4d9e-a826-955192f9b2c4
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: telur ayam
 *               quantity:
 *                 type: string
 *                 example: 6 pcs
 *     responses:
 *       200:
 *         description: Pantry item updated successfully
 *       404:
 *         description: Pantry item not found
 */
router.put("/:id", verifyUser, updatePantryItem);

export default router;
