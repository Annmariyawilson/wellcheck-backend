import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../util";
import { supabase } from "../supabaseClient";

export const createUser = async (req: Request, res: Response) => {
  const { username, password, class_id, phone, dob } = req.body;

  try {
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from("student")
      .insert([{ username, password: hashedPassword, class_id, phone, dob }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(400).json({
        message: error.message || "Insert failed",
        details: error.details,
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      data,
    });
  } catch (err: any) {
    console.error("Server Error:", err);

    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const loginStudent = async (req: Request, res: Response) => {
  console.log(req.body)
  const { username, password } = req.body;

  try {
    // 1. Get student by username
    const { data: student, error } = await supabase.from("student").select("*").eq("username", username).single();

    if (error || !student) {
      return res.status(400).json({ message: "Student account not found with this username" });
    }

    // 2. Check password
    console.log(student);
    const passwordMatch = await comparePassword(password, student.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect username or password" });
    }

    // 3. Login success
    return res.status(200).json({
      message: "Login successful",
      data: student,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const { data: students, error } = await supabase.from("student").select("*");

    if (error) {
      return res.status(400).json({
        message: "Error fetching users",
        error: error.message,
      });
    }

    return res.status(200).json({
      students,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Server error fetching users",
      error: err.message,
    });
  }
};

// FORGOT PASSWORD

export const forgotPasswordStudent = async (req: Request, res: Response) => {
  const { phone, dob, newPassword } = req.body;

  const { data, error } = await supabase
    .from("student")
    .select("*")
    .eq("phone", phone)
    .eq("dob", dob)
    .single();

  if (error || !data)
    return res.status(400).json({ message: "Invalid details" });

  const hashed = await hashPassword(newPassword);

  await supabase
    .from("student")
    .update({ password: hashed })
    .eq("id", data.id);

  res.status(200).json({
    message: "Password changed successfully",
    username: data.username,
  });
};

// TEACHER RESET STUDENT PASSWORD

export const teacherResetStudentPassword = async ( req: Request, res: Response ) => {
  const { student_id, newPassword } = req.body;

  const hashed = await hashPassword(newPassword);

  const { error } = await supabase
    .from("student")
    .update({ password: hashed })
    .eq("id", student_id);

  if (error)
    return res.status(400).json({ message: "Failed to update password" });

  res.status(200).json({
    message: "Password reset successfully",
  });
};

