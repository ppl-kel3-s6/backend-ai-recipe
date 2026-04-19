import { supabase } from "../config/supabase.js";

export const addPantryItem = async (req, res) => {
  const userId = req.user.id;
  const { name, quantity } = req.body;

  const { data, error } = await supabase
    .from("pantry_items")
    .insert([
      {
        user_id: userId,
        name,
        quantity,
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const getPantry = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deletePantryItem = async (req, res) => {
  const { id } = req.query;
  const userId = req.user.id;

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Deleted" });
};

export const scanPantry = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      error: "No image uploaded",
    });
  }

  // sementara dummy
  const detectedItems = ["telur", "tomat"];

  res.json({
    message: "Scan success",
    items: detectedItems,
    image_url: file.path,
  });
};

export const savePantryItems = async (req, res) => {
  const userId = req.user.id;
  const { items, image_url } = req.body;

  const insertData = items.map((item) => ({
    user_id: userId,
    name: item,
    quantity: 1,
    image_url,
  }));

  const { data, error } = await supabase
    .from("pantry_items")
    .insert(insertData)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "Saved to pantry",
    data,
  });
};
