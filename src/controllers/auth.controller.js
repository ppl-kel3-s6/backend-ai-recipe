import { supabase } from "../config/supabase.js";

export const register = async (req, res) => {
  const { email, password, fullname } = req.body;

  // signup ke supabase auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullname: fullname,
      },
    },
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

  // Ambil profile user dari tabel users untuk mendapatkan fullname terbaru
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.session.user.id)
    .single();

  res.json({
    message: "Login success",
    session: data.session,
    profile,
  });
};

export const continueWithGoogle = async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: process.env.FRONTEND_URL,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    url: data.url,
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const redirectUrl = `${process.env.FRONTEND_URL}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "Reset password email sent",
  });
};

export const updatePassword = async (req, res) => {
  const { password } = req.body;
  const { data, error } = await supabase.auth.admin.updateUserById(
    req.user.id,
    { password },
  );

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "Password updated",
  });
};
