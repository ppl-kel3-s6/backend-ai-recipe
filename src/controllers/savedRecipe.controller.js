import { supabase } from "../config/supabase.js";

export const saveRecipe = async (req, res) => {
  const userId = req.user.id;
  const { recipe_id } = req.body;

  if (!recipe_id) {
    return res.status(400).json({ error: "recipe_id is required" });
  }

  const { data, error } = await supabase
    .from("saved_recipes")
    .insert([
      {
        user_id: userId,
        recipe_id,
      },
    ])
    .select();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Recipe already saved",
      });
    }

    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: "Recipe saved",
    data: data[0],
  });
};

export const getSavedRecipes = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("saved_recipes")
    .select(
      `
      id,
      saved_at,
      recipe:recipes (
        id,
        title,
        description,
        cuisine,
        category,
        image_url,
        prep_time,
        cook_time,
        servings
      )
    `,
    )
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: "Saved recipes fetched",
    data,
  });
};

export const unsaveRecipe = async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  const { data, error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      error: "Saved recipe not found",
    });
  }

  res.json({
    message: "Recipe unsaved",
  });
};
