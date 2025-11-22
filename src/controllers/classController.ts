import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

// CREATE CLASS
export const createClass = async (req: Request, res: Response) => {
  const { name } = req.body;

  const { data, error } = await supabase
    .from("class")
    .insert([{ name }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  res.status(201).json({ message: "Class created", data });
};

// GET ALL CLASSES
export const getClasses = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("class").select("*");

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json({ classes: data });
};
