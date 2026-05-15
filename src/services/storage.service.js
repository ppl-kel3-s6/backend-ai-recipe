import { supabase } from "../config/supabase.js";

export const uploadPantryImage = async (file, userId) => {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("pantry-images")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("pantry-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
