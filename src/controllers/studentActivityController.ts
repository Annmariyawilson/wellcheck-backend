import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

// CREATE STUDENT ACTIVITY (ONE PER DAY)
export const createActivity = async (req: Request, res: Response) => {
  const { student_id, value, remark } = req.body;

  // Get today's start and end time
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. Check if activity exists for today
  const { data: existing, error: existingError } = await supabase
    .from("student_activity")
    .select("*")
    .eq("student_id", student_id)
    .gte("created_at", todayStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  if (existingError) {
    return res.status(400).json({ message: existingError.message });
  }

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: "You already submitted today's mood.",
      existingActivity: existing[0],
    });
  }

  // 2. Insert activity
  const { data, error } = await supabase
    .from("student_activity")
    .insert([{ student_id, value, remark }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  res.status(201).json({
    success: true,
    message: "Today's mood submitted successfully",
    data,
  });
};


// GET ACTIVITY FOR STUDENT
export const getStudentActivity = async (req: Request, res: Response) => {
  const student_id = req.params.id;

  const { data, error } = await supabase
    .from("student_activity")
    .select("*")
    .eq("student_id", student_id);

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json({ activities: data });
};
