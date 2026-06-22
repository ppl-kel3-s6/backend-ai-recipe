import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load 666 MealDB valid names
let validMealDbNames = [];
try {
  const dataPath = path.join(__dirname, "../../mealdb-names.json");
  if (fs.existsSync(dataPath)) {
    validMealDbNames = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  }
} catch (e) {
  console.error("Gagal load mealdb-names.json", e);
}

const apiKeys = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(k => k) : [];

const generateWithFallback = async (prompt, model) => {
  if (apiKeys.length === 0) throw new Error("GEMINI_API_KEY is not set or empty.");

  let lastError;
  for (let i = 0; i < apiKeys.length; i++) {
    const ai = new GoogleGenAI({ apiKey: apiKeys[i] });
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      return response;
    } catch (err) {
      lastError = err;
      // Jika error 429 (Limit) atau 503 (Server Overload), coba API Key berikutnya
      if (
        err.status === 429 || err.status === 503 ||
        (err.message && (err.message.includes("429") || err.message.includes("503") || err.message.includes("Quota") || err.message.includes("high demand")))
      ) {
        console.warn(`[Gemini API] Key ${i + 1} gagal (${err.status || 'Quota/Overload'}). Mencoba Key berikutnya...`);
        continue;
      }
      // Jika error lain (misal koneksi terputus), langsung lemparkan error
      throw err;
    }
  }
  // Jika semua key habis/kena limit
  throw lastError;
};

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

  // Shuffle and pick 200 random valid MealDB names to give Gemini a large menu to choose from
  const shuffledNames = [...validMealDbNames].sort(() => 0.5 - Math.random());
  const sampleNames = shuffledNames.slice(0, 200).join(", ");

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
- SANGAT PENTING: Untuk referensi gambar MealDB, SILAKAN PILIH hidangan dari daftar berikut jika bahan-bahannya relevan:
[ ${sampleNames} ]
- PENTING: Jika kamu memilih dari daftar tersebut, masukkan nama asli bahasa Inggrisnya ke dalam "original_mealdb_name".
- PENTING: Untuk "title", WAJIB buat nama makanannya dalam Bahasa Indonesia yang menarik dan selera Nusantara! (Contoh: "Ayam Panggang Asam Manis").
- PENTING: Jika resep buatan murni (bukan dari daftar), kosongkan string "original_mealdb_name" ("").
- Seluruh teks lainnya (reason, dll) HARUS dalam Bahasa Indonesia.

Format:
{
  "suggestions": [
    {
      "title": "Nama makanan (Bahasa Indonesia)",
      "original_mealdb_name": "English MealDB name (jika ada)",
      "category": "Breakfast",
      "cuisine": "American",
      "used_ingredients": ["telur", "tomat"],
      "missing_common_ingredients": ["garam", "minyak"],
      "match_score": 90,
      "reason": "Alasan singkat",
      "prep_time": 15,
      "cook_time": 20,
      "servings": 2
    }
  ]
}
`;

  const response = await generateWithFallback(prompt, "gemini-2.5-flash");

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

  const response = await generateWithFallback(prompt, "gemini-2.5-flash");

  const recipe = safeJsonParse(response.text);

  return {
    ...recipe,
    category: normalizeCategory(recipe.category),
    cuisine: normalizeCuisine(recipe.cuisine),
    image_url,
  };
};
