import { supabase } from "../config/supabase.js";

export const register = async (req, res) => {
  const { email, password, fullname } = req.body;

  // signup ke supabase auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  const user = data.user;

  // insert ke tabel users (profile)
  const { error: profileError } = await supabase.from("users").insert({
    id: user.id,
    fullname,
  });

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  res.json({
    message: "User registered",
    user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "Login success",
    session: data.session,
  });
};
