import axios from "axios";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

export const getRandomMeal = async () => {
  const response = await axios.get(`${MEALDB_BASE}/random.php`);
  return response.data.meals?.[0] || null;
};

export const getMealCategories = async () => {
  const response = await axios.get(`${MEALDB_BASE}/list.php?c=list`);
  return response.data.meals || [];
};

export const getMealAreas = async () => {
  const response = await axios.get(`${MEALDB_BASE}/list.php?a=list`);
  return response.data.meals || [];
};

export const getMealsByCategoryService = async (category) => {
  const response = await axios.get(`${MEALDB_BASE}/filter.php?c=${category}`);
  return response.data.meals || [];
};

export const getMealsByAreaService = async (area) => {
  const response = await axios.get(`${MEALDB_BASE}/filter.php?a=${area}`);
  return response.data.meals || [];
};

export const searchMealsService = async (query) => {
  const response = await axios.get(`${MEALDB_BASE}/search.php?s=${query}`);
  return response.data.meals || [];
};

export const getMealDetailService = async (id) => {
  const response = await axios.get(`${MEALDB_BASE}/lookup.php?i=${id}`);
  return response.data.meals?.[0] || null;
};

export const getMealsByIngredientService = async (ingredient) => {
  const response = await axios.get(`${MEALDB_BASE}/filter.php?i=${ingredient}`);
  return response.data.meals || [];
};

export const findMealImageByTitleService = async (title) => {
  const meals = await searchMealsService(title);

  if (!meals || meals.length === 0) {
    return null;
  }

  return meals[0].strMealThumb || null;
};
