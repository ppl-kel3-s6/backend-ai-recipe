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

export const saveMealdbRecipe = async (req, res) => {
  const userId = req.user.id;
  const { title, category, cuisine, image_url, prep_time, cook_time, servings, description, ingredients, instructions } = req.body;

  let { data: existingRecipes, error: findError } = await supabase
    .from("recipes")
    .select("id")
    .eq("title", title)
    .limit(1);

  let recipeId;

  if (existingRecipes && existingRecipes.length > 0) {
    recipeId = existingRecipes[0].id;
  } else {
    // Parse strings like "30 Menit" into integers for DB
    const parseToInt = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      const match = val.toString().match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    const { data: newRecipe, error: insertError } = await supabase
      .from("recipes")
      .insert([
        {
          author: userId,
          title,
          description,
          cuisine,
          category,
          image_url,
          prep_time: parseToInt(prep_time),
          cook_time: parseToInt(cook_time),
          servings: parseToInt(servings),
          ingredients: ingredients ? ingredients.map(ing => ({ item: ing, amount: "", category: "Other" })) : [],
          instructions: instructions ? instructions.map((ins, i) => ({ step: i + 1, instruction: ins, title: "", tip: "" })) : [],
          is_public: false,
        }
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(400).json({ error: insertError.message });
    }
    recipeId = newRecipe[0].id;
  }

  const { data, error } = await supabase
    .from("saved_recipes")
    .insert([ { user_id: userId, recipe_id: recipeId } ])
    .select();

  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Recipe already saved" });
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Recipe saved from MealDB/AI", data: data[0] });
};

export const unsaveMealdbRecipe = async (req, res) => {
  const userId = req.user.id;
  const { title } = req.params;

  const { data: existingRecipes, error: findError } = await supabase
    .from("recipes")
    .select("id")
    .eq("title", title)
    .limit(1);

  if (findError || !existingRecipes || existingRecipes.length === 0) {
    return res.status(404).json({ error: "Recipe not found in database" });
  }

  const recipeId = existingRecipes[0].id;

  const { data, error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Recipe unsaved" });
};
