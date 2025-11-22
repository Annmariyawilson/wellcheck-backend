import { Request, Response } from "express";
import { supabase } from "../supabaseClient";
import { hashPassword, comparePassword } from "../util";

// CREATE TEACHER
export const createTeacher = async (req: Request, res: Response) => {
  const { username, password, class_id } = req.body;

  try {
    const hashed = await hashPassword(password);

    const { data, error } = await supabase
      .from("teacher")
      .insert([{ username, password: hashed,class_id }])
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.status(201).json({ message: "Teacher created", data });
  } catch (err: any) {
    res.status(500).json({ message: "Error creating teacher" });
  }
};

// LOGIN TEACHER
export const loginTeacher = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const { data: teacher, error } = await supabase
    .from("teacher")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !teacher)
    return res.status(400).json({ message: "Teacher not found" });

  const match = await comparePassword(password, teacher.password);

  if (!match)
    return res.status(400).json({ message: "Invalid username or password" });

  res.status(200).json({ message: "Login successful", data: teacher });
};

export const getTeacherById = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("teacher")
    .select("id, username, class_id")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(400).json({ message: "Teacher not found" });
  }

  res.status(200).json({ data });
};

