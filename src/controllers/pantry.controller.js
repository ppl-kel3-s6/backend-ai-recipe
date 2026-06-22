import { supabase } from "../config/supabase.js";
import { uploadPantryImage } from "../services/storage.service.js";
import axios from "axios";

// Mapping English query keys (for OWL-ViT model) to Indonesian database values.
// Contains 200+ items focusing on Indonesian cooking ingredients, vegetables, meats, herbs, and spices.
const ingredientMapping = {
  // Spices, Herbs & Aromatics (Rempah & Herba)
  "shallot": "bawang merah",
  "garlic": "bawang putih",
  "onion": "bawang bombay",
  "scallion": "daun bawang",
  "chili": "cabai",
  "red chili": "cabai merah",
  "green chili": "cabai hijau",
  "cayenne pepper": "cabai rawit",
  "ginger": "jahe",
  "turmeric": "kunyit",
  "galangal": "lengkuas",
  "lemongrass": "serai",
  "lime leaf": "daun jeruk",
  "bay leaf": "daun salam",
  "coriander": "ketumbar",
  "clove": "cengkeh",
  "nutmeg": "pala",
  "cinnamon": "kayu manis",
  "cardamom": "kapulaga",
  "cumin": "jinten",
  "tamarind": "asam jawa",
  "pandan leaf": "daun pandan",
  "basil": "daun kemangi",
  "celery": "seledri",
  "candlenut": "kemiri",
  "star anise": "bunga lawang",
  "fennel": "adas",
  "sesame": "wijen",
  "shrimp paste": "terasi",
  "mint leaves": "daun mint",
  "parsley": "peterseli",
  "oregano": "oregano",
  "rosemary": "rosemary",
  "thyme": "thyme",
  "vanilla": "vanili",
  "garlic chives": "kucai",
  "curry leaves": "daun kari",
  "turmeric powder": "kunyit bubuk",
  "ginger powder": "jahe bubuk",
  "garlic powder": "bawang putih bubuk",
  "onion powder": "bawang bombay bubuk",
  "chili powder": "cabai bubuk",
  "coriander powder": "ketumbar bubuk",
  "pepper powder": "merica bubuk",
  "white pepper": "lada putih",
  "black pepper": "lada hitam",
  "clove powder": "cengkeh bubuk",
  "nutmeg powder": "pala bubuk",
  "cinnamon powder": "kayu manis bubuk",
  "vanilla extract": "ekstrak vanili",
  "curry powder": "bubuk kari",
  "pepper": "merica",
  "cayenne": "cabai rawit bubuk",
  "paprika": "paprika",
  "bell pepper": "paprika",
  "red bell pepper": "paprika merah",
  "green bell pepper": "paprika hijau",
  "yellow bell pepper": "paprika kuning",
  "mustard seeds": "biji sesawi",
  "dill": "adas sowa",
  "coriander leaves": "daun ketumbar",
  "cilantro": "daun ketumbar",

  // Vegetables (Sayuran)
  "spinach": "bayam",
  "water spinach": "kangkung",
  "mustard greens": "sawi hijau",
  "cabbage": "kol",
  "broccoli": "brokoli",
  "cauliflower": "kembang kol",
  "carrot": "wortel",
  "potato": "kentang",
  "tomato": "tomat",
  "cucumber": "mentimun",
  "eggplant": "terong",
  "long beans": "kacang panjang",
  "green beans": "buncis",
  "chayote": "labu siam",
  "pumpkin": "labu kuning",
  "corn": "jagung",
  "bean sprouts": "taoge",
  "cassava leaves": "daun singkong",
  "young jackfruit": "nangka muda",
  "bamboo shoots": "rebung",
  "bitter melon": "pare",
  "mushroom": "jamur",
  "oyster mushroom": "jamur tiram",
  "wood ear mushroom": "jamur kuping",
  "button mushroom": "jamur kancing",
  "okra": "okra",
  "radish": "lobak",
  "lettuce": "selada",
  "bok choy": "pakcoy",
  "asparagus": "asparagus",
  "moringa leaves": "daun kelor",
  "napa cabbage": "sawi putih",
  "watercress": "selada air",
  "sweet corn": "jagung manis",
  "baby corn": "putren",
  "taro leaves": "daun talas",
  "pea": "kacang polong",
  "sweet potato leaves": "daun ubi",

  // Proteins & Meats (Protein & Daging)
  "egg": "telur",
  "chicken egg": "telur ayam",
  "duck egg": "telur bebek",
  "quail egg": "telur puyuh",
  "salted egg": "telur asin",
  "century egg": "telur pitan",
  "chicken": "ayam",
  "chicken breast": "dada ayam",
  "chicken thigh": "paha ayam",
  "chicken wing": "sayap ayam",
  "beef": "daging sapi",
  "beef shank": "sengkel",
  "beef ribs": "iga sapi",
  "oxtail": "buntut sapi",
  "ground beef": "daging sapi cincang",
  "ground chicken": "daging ayam cincang",
  "mutton": "daging kambing",
  "pork": "daging babi",
  "pork belly": "samcan",
  "duck": "daging bebek",
  "chicken liver": "hati ayam",
  "chicken gizzard": "ampela ayam",
  "duck gizzard": "ampela bebek",
  "meatball": "bakso",
  "sausage": "sosis",
  "bacon": "daging asap",
  "ham": "daging ham",
  "tripe": "babat",
  "tendon": "urat sapi",

  // Seafood (Makanan Laut)
  "shrimp": "udang",
  "squid": "cumi-cumi",
  "crab": "kepiting",
  "clam": "kerang",
  "lobster": "lobster",
  "fish": "ikan",
  "carp": "ikan mas",
  "tilapia": "ikan nila",
  "catfish": "ikan lele",
  "tuna": "ikan tuna",
  "salmon": "ikan salem",
  "anchovy": "ikan teri",
  "salted fish": "ikan asin",
  "snapper": "ikan kakap",
  "grouper": "ikan kerapu",
  "pomfret": "ikan bawal",
  "mackerel": "ikan kembung",
  "milkfish": "ikan bandeng",
  "gourami": "ikan gurame",
  "seaweed": "rumput laut",

  // Plant Proteins & Legumes (Kacang-kacangan & Nabati)
  "tempeh": "tempe",
  "tofu": "tahu",
  "peanut": "kacang tanah",
  "cashew": "kacang mede",
  "mung bean": "kacang hijau",
  "red bean": "kacang merah",
  "soybean": "kacang kedelai",
  "chickpea": "kacang arab",
  "lentils": "lentil",
  "walnut": "kacang kenari",
  "hazelnut": "kacang hazel",
  "almond": "almond",
  "dogfruit": "jengkol",
  "bitter bean": "pete",

  // Fruits (Buah-buahan)
  "banana": "pisang",
  "mango": "mangga",
  "orange": "jeruk",
  "lime": "jeruk nipis",
  "kaffir lime": "jeruk purut",
  "lemon": "lemon",
  "pineapple": "nanas",
  "papaya": "pepaya",
  "melon": "melon",
  "watermelon": "semangka",
  "avocado": "alpukat",
  "apple": "apel",
  "grape": "anggur",
  "strawberry": "strawberry",
  "jackfruit": "nangka",
  "durian": "durian",
  "rambutan": "rambutan",
  "manggis": "manggis",
  "guava": "jambu biji",
  "soursop": "sirsak",
  "starfruit": "belimbing",
  "date fruit": "kurma",
  "pear": "pir",
  "dragon fruit": "buah naga",
  "kiwi": "kiwi",
  "lychee": "leci",
  "coconut": "kelapa",
  "palm fruit": "kolang-kaling",
  "raisin": "kismis",

  // Carbs, Starches & Flours (Karbohidrat & Tepung)
  "rice": "beras",
  "glutinous rice": "ketan",
  "wheat flour": "tepung terigu",
  "rice flour": "tepung beras",
  "glutinous rice flour": "tepung ketan",
  "tapioca starch": "tepung tapioka",
  "cornstarch": "tepung maizena",
  "sago flour": "tepung sagu",
  "breadcrumbs": "tepung roti",
  "rice vermicelli": "bihun",
  "glass noodles": "soun",
  "noodle": "mie",
  "pasta": "pasta",
  "bread": "roti",
  "cassava": "singkong",
  "sweet potato": "ubi jalar",
  "taro": "talas",

  // Dairy & Processed (Susu & Olahan)
  "cheese": "keju",
  "yogurt": "yogurt",
  "milk": "susu",
  "cream": "krim",
  "butter": "mentega",
  "margarine": "margarin",

  // Liquid, Sauces & Oils (Cairan, Saus & Minyak)
  "coconut milk": "santan",
  "grated coconut": "kelapa parut",
  "palm sugar": "gula merah",
  "sugar": "gula pasir",
  "salt": "garam",
  "sweet soy sauce": "kecap manis",
  "soy sauce": "kecap asin",
  "oyster sauce": "saus tiram",
  "chili sauce": "saus sambal",
  "tomato sauce": "saus tomat",
  "vinegar": "cuka",
  "honey": "madu",
  "cooking oil": "minyak goreng",
  "sesame oil": "minyak wijen",
  "olive oil": "minyak zaitun",
  "fish sauce": "saus ikan",
  "hot sauce": "saus pedas",
  "barbecue sauce": "saus barbekyu",
  "coconut water": "air kelapa",
  "soda water": "air soda",
  "lime juice": "air jeruk nipis",
  "lemon juice": "air lemon",

  // Other Baking & Seasoning (Lain-lain)
  "yeast": "ragi",
  "baking powder": "baking powder",
  "baking soda": "baking soda",
  "cocoa powder": "cokelat bubuk",
  "matcha powder": "matcha bubuk",
  "broth powder": "kaldu bubuk",
  "mayonnaise": "mayones",
  "black tea": "teh hitam",
  "green tea": "teh hijau",
  "coffee beans": "biji kopi",
  "coffee powder": "kopi bubuk",
  "marshmallow": "marshmallow",
  "gelatin": "gelatin",
  "agar agar": "agar-agar",
  "jelly": "jeli",
  "grass jelly": "cincau",
  "basil seeds": "biji selasih",
  "brown sugar": "gula cokelat",
  "powdered sugar": "gula halus",
  "shrimp bouillon": "kaldu udang",
  "chicken bouillon": "kaldu ayam",
  "beef bouillon": "kaldu sapi",
  "mushroom bouillon": "kaldu jamur",
  "msg": "micin",
  "tapioca pearl": "sagu mutiara",
  "perilla": "daun perilla",
  "sage": "daun sage"
};

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
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      error: "No image uploaded",
    });
  }

  try {
    const imageUrl = await uploadPantryImage(file, userId);
    let detectedItems = [];

    const detectionServiceUrl = process.env.DETECTION_SERVICE_URL;

    if (!detectionServiceUrl) {
      console.warn("WARNING: DETECTION_SERVICE_URL is not defined in environment variables. Falling back to dummy detection.");
      detectedItems = ["telur", "tomat"];
    } else {
      // Call Hugging Face python microservice
      const response = await axios.post(`${detectionServiceUrl.replace(/\/$/, "")}/detect`, {
        image_url: imageUrl,
        candidate_labels: Object.keys(ingredientMapping),
        threshold: 0.12
      }, {
        timeout: 20000 // 20s timeout since HF space might need time to fetch image and run inference
      });

      if (response.data && response.data.success) {
        const detectedEnglish = response.data.detected_labels || [];
        // Map detected English labels to Indonesian
        const mappedIndonesian = detectedEnglish
          .map(label => ingredientMapping[label])
          .filter(Boolean);
        
        // Remove duplicates
        detectedItems = [...new Set(mappedIndonesian)];
      } else {
        throw new Error("Invalid response structure from detection service");
      }
    }

    res.json({
      message: "Scan success",
      items: detectedItems,
      image_url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to scan pantry image using OWL-ViT",
      detail: error.message,
    });
  }
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

export const updatePantryItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, quantity } = req.body;

  // optional validation
  if (!name && !quantity) {
    return res.status(400).json({
      error: "Nothing to update",
    });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (quantity) updateData.quantity = quantity;

  const { data, error } = await supabase
    .from("pantry_items")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      error: "Item not found or not authorized",
    });
  }

  res.json({
    message: "Pantry item updated",
    data: data[0],
  });
};
