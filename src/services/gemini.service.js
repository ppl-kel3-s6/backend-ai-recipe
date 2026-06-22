import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const allowedCategories = [
  "Beef",
  "Chicken",
  "Dessert",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
  "Breakfast",
  "Goat",
];

const allowedCuisines = [
  "American",
  "British",
  "Canadian",
  "Chinese",
  "Croatian",
  "Dutch",
  "Egyptian",
  "Filipino",
  "French",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Kenyan",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Thai",
  "Tunisian",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
];

const safeJsonParse = (text) => {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

const normalizeCategory = (category) => {
  return allowedCategories.includes(category) ? category : "Miscellaneous";
};

const normalizeCuisine = (cuisine) => {
  return allowedCuisines.includes(cuisine) ? cuisine : "American";
};

export const generateFoodSuggestionsFromPantry = async (pantryItems) => {
  const ingredientsText = pantryItems
    .map((item) => `${item.name}${item.quantity ? ` (${item.quantity})` : ""}`)
    .join(", ");

  const prompt = `
Kamu adalah AI chef untuk aplikasi AI Recipe Platform.

Berdasarkan pantry berikut:
${ingredientsText}

Buat 8 rekomendasi makanan dari kombinasi bahan pantry.

Aturan:
- Jangan hanya berdasarkan 1 bahan.
- Gunakan kombinasi beberapa bahan pantry.
- Category WAJIB salah satu dari:
${allowedCategories.join(", ")}

- Cuisine WAJIB salah satu dari:
${allowedCuisines.join(", ")}

- Jangan buat category/cuisine baru.
- Jika tidak yakin, gunakan category "Miscellaneous" dan cuisine "American".
- Jangan sertakan gambar.
- Output valid JSON saja, tanpa markdown.
- PENTING: Semua teks (termasuk title makanan, reason, dll) HARUS dalam Bahasa Indonesia.

Format:
{
  "suggestions": [
    {
      "title": "Nama makanan",
      "category": "Breakfast",
      "cuisine": "American",
      "used_ingredients": ["telur", "tomat"],
      "missing_common_ingredients": ["garam", "minyak"],
      "match_score": 90,
      "reason": "Alasan singkat"
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const result = safeJsonParse(response.text);

  const suggestions = (result.suggestions || []).map((item) => ({
    ...item,
    category: normalizeCategory(item.category),
    cuisine: normalizeCuisine(item.cuisine),
  }));

  return { suggestions };
};

export const generateRecipeDetail = async ({
  title,
  category,
  cuisine,
  pantryItems = [],
  image_url = null,
}) => {
  const pantryText = pantryItems
    .map((item) => `${item.name}${item.quantity ? ` (${item.quantity})` : ""}`)
    .join(", ");

  const finalCategory = normalizeCategory(category);
  const finalCuisine = normalizeCuisine(cuisine);

  const prompt = `
Kamu adalah AI chef untuk aplikasi AI Recipe Platform.

Buat resep detail untuk makanan:
${title}

Category: ${finalCategory}
Cuisine: ${finalCuisine}

Bahan pantry user:
${pantryText}

Aturan:
- Title output HARUS sama persis dengan: ${title}
- Jangan terjemahkan title.
- Jangan ubah nama makanan.
- Gunakan bahan pantry jika relevan.
- Boleh tambah bahan umum seperti garam, minyak, gula, lada, air.
- Category harus tetap: ${finalCategory}
- Cuisine harus tetap: ${finalCuisine}
- Output harus valid JSON saja, tanpa markdown.
- Jangan gunakan substitutions.
- PENTING: Seluruh instruksi, deskripsi, tips, nama bahan HARUS dalam Bahasa Indonesia.

Format JSON:
{
  "title": "Nama resep",
  "description": "Deskripsi singkat resep",
  "cuisine": "${finalCuisine}",
  "category": "${finalCategory}",
  "ingredients": [
    {
      "item": "Nama bahan",
      "amount": "Jumlah",
      "category": "Protein / Vegetable / Carbohydrate / Seasoning / Other"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "title": "Judul langkah",
      "instruction": "Instruksi memasak",
      "tip": "Tips singkat"
    }
  ],
  "prep_time": 10,
  "cook_time": 20,
  "servings": 2,
  "nutrition": {
    "calories": 350,
    "protein": "15g",
    "carbs": "40g",
    "fat": "12g"
  },
  "tips": [
    "Tips memasak"
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const recipe = safeJsonParse(response.text);

  return {
    ...recipe,
    category: normalizeCategory(recipe.category),
    cuisine: normalizeCuisine(recipe.cuisine),
    image_url,
  };
};
