import { supabase } from "../config/supabase.js";

export const generateRecipe = async (req, res) => {
  const userId = req.user.id;

  // Ambil pantry user
  const { data: pantry, error: pantryError } = await supabase
    .from("pantry_items")
    .select("name, quantity")
    .eq("user_id", userId);

  if (pantryError) {
    return res.status(400).json({ error: pantryError.message });
  }

  if (!pantry || pantry.length === 0) {
    return res.status(400).json({
      error: "Pantry kosong",
    });
  }

  const ingredientsList = pantry.map((item) => item.name);

  // Cari di DB
  const { data: existingRecipes } = await supabase
    .from("recipes")
    .select("*")
    .limit(10);

  // Cari recipe paling cocok
  let bestMatch = null;
  let bestScore = 0;

  for (const recipe of existingRecipes) {
    const recipeIngredients = recipe.ingredients || [];

    const matchCount = recipeIngredients.filter((ing) =>
      ingredientsList.includes(ing),
    ).length;

    const score = matchCount / recipeIngredients.length;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = recipe;
    }
  }

  // Kalau ketemu yang cocok
  if (bestMatch && bestScore >= 0.6) {
    return res.json({
      source: "database",
      score: bestScore,
      recipe: bestMatch,
    });
  }

  // Ketika tidak ada recipe di DB, maka generate AI (Dummy AI dulu)
  const recipe = {
    title: "Resep dari pantry kamu",
    description: "Resep sederhana berdasarkan bahan yang tersedia",
    ingredients: ingredientsList,
    instructions: [
      "Panaskan minyak",
      "Masukkan semua bahan",
      "Masak hingga matang",
    ],
    prep_time: 10,
    cook_time: 15,
    servings: 2,
  };

  // Simpan ke DB
  const { data: savedRecipe, error: saveError } = await supabase
    .from("recipes")
    .insert([
      {
        author: userId,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        is_public: false,
      },
    ])
    .select();

  if (saveError) {
    return res.status(400).json({ error: saveError.message });
  }

  res.json({
    message: "Recipe generated",
    recipe: savedRecipe[0],
  });
};
