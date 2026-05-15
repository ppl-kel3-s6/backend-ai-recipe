import axios from "axios";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

export const getRecipeOfTheDay = async (req, res) => {
  try {
    const response = await axios.get(`${MEALDB_BASE}/random.php`);

    const meal = response.data.meals?.[0];

    res.json({
      success: true,
      meal: {
        mealdb_id: meal.idMeal,
        title: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch recipe of the day",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const response = await axios.get(`${MEALDB_BASE}/list.php?c=list`);

    res.json({
      success: true,
      categories: response.data.meals || [],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch categories",
    });
  }
};

export const getAreas = async (req, res) => {
  try {
    const response = await axios.get(`${MEALDB_BASE}/list.php?a=list`);

    res.json({
      success: true,
      areas: response.data.meals || [],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch areas",
    });
  }
};

export const getMealsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const response = await axios.get(`${MEALDB_BASE}/filter.php?c=${category}`);

    const meals = response.data.meals || [];

    res.json({
      success: true,
      category,
      meals: meals.map((meal) => ({
        mealdb_id: meal.idMeal,
        title: meal.strMeal,
        thumbnail: meal.strMealThumb,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch meals by category",
    });
  }
};

export const getMealsByArea = async (req, res) => {
  try {
    const { area } = req.params;

    const response = await axios.get(`${MEALDB_BASE}/filter.php?a=${area}`);

    const meals = response.data.meals || [];

    res.json({
      success: true,
      area,
      meals: meals.map((meal) => ({
        mealdb_id: meal.idMeal,
        title: meal.strMeal,
        thumbnail: meal.strMealThumb,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch meals by area",
    });
  }
};

export const searchMeals = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    const response = await axios.get(`${MEALDB_BASE}/search.php?s=${q}`);

    const meals = response.data.meals || [];

    res.json({
      success: true,
      query: q,
      meals: meals.map((meal) => ({
        mealdb_id: meal.idMeal,
        title: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to search meals",
    });
  }
};

export const getMealDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${MEALDB_BASE}/lookup.php?i=${id}`);

    const meal = response.data.meals?.[0];

    if (!meal) {
      return res.status(404).json({
        error: "Meal not found",
      });
    }

    res.json({
      success: true,
      meal: {
        mealdb_id: meal.idMeal,
        title: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch meal detail",
    });
  }
};
