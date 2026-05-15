import { supabase } from "../config/supabase.js";

export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    const user = data.user;

    // cek profile user di table users
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // kalau belum ada → insert otomatis
    if (!existingUser) {
      await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          fullname:
            user.user_metadata?.full_name || user.user_metadata?.name || "User",
          image_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
        },
      ]);
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Authentication failed",
      detail: error.message,
    });
  }
};
