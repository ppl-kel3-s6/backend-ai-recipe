import {
  getRandomMeal,
  getMealCategories,
  getMealAreas,
  getMealsByCategoryService,
  getMealsByAreaService,
  searchMealsService,
  getMealDetailService,
} from "../services/mealdb.service.js";

const formatMealPreview = (meal) => ({
  mealdb_id: meal.idMeal,
  title: meal.strMeal,
  thumbnail: meal.strMealThumb,
  category: meal.strCategory,
  area: meal.strArea,
});

const formatMealCard = (meal) => ({
  mealdb_id: meal.idMeal,
  title: meal.strMeal,
  thumbnail: meal.strMealThumb,
});

export const getRecipeOfTheDay = async (req, res) => {
  try {
    const meal = await getRandomMeal();

    res.json({
      success: true,
      meal: formatMealPreview(meal),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipe of the day" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await getMealCategories();

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const getAreas = async (req, res) => {
  try {
    const areas = await getMealAreas();

    res.json({
      success: true,
      areas,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch areas" });
  }
};

export const getMealsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const meals = await getMealsByCategoryService(category);

    res.json({
      success: true,
      category,
      meals: meals.map(formatMealCard),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals by category" });
  }
};

export const getMealsByArea = async (req, res) => {
  try {
    const { area } = req.params;
    const meals = await getMealsByAreaService(area);

    res.json({
      success: true,
      area,
      meals: meals.map(formatMealCard),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals by area" });
  }
};

export const searchMeals = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.status(400).json({ error: "Query is required" });

    const meals = await searchMealsService(q);

    res.json({
      success: true,
      query: q,
      meals: meals.map(formatMealPreview),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to search meals" });
  }
};

export const getMealDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const meal = await getMealDetailService(id);

    if (!meal) return res.status(404).json({ error: "Meal not found" });

    res.json({
      success: true,
      meal: formatMealPreview(meal),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meal detail" });
  }
};
