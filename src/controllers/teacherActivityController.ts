import { Request, Response } from "express";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";

export const getTeacherClassActivity = async (req: Request, res: Response) => {
  const teacher_id = req.params.id;

  // 1. teacher ID
  const { data: teacher, error: teacherErr } = await supabase
    .from("teacher")
    .select("*")
    .eq("id", teacher_id)
    .single();

  if (teacherErr || !teacher) {
    return res.status(400).json({ message: "Teacher not found" });
  }

  const class_id = teacher.class_id;

  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  const startOfDay = `${dateOnly}T00:00:00.000Z`;
  const endOfDay = `${dateOnly}T23:59:59.999Z`;

  const { data: studentsWithActivity, error } = await supabase
    .from("student")
    .select(
      `
    *,
    student_activity (
      id,
      value,
      remark,
      created_at,
      student_id
    )
  `
    )
    .eq("class_id", class_id)
    .gte("student_activity.created_at", startOfDay)
    .lte("student_activity.created_at", endOfDay);
  const notCompletedCount = studentsWithActivity?.filter(
    (s) => s.student_activity.length == 0
  ).length;
  const completed = studentsWithActivity?.filter(
    (s) => s.student_activity.length != 0
  ).length;
  const groups: Record<string, any[]> = {};

  if (studentsWithActivity && studentsWithActivity.length > 0) {
    studentsWithActivity.forEach((student) => {
      const value = student.student_activity[0]?.value ?? "no_activity";

      if (!groups[value]) {
        groups[value] = [];
      }

      groups[value].push(student);
    });
  }

  // 3. Convert to array format (as required)

  return res.status(200).json({
    class_id,
    teacher,
    totalStudents: (studentsWithActivity || []).length,
    completed,
    notCompleted: notCompletedCount,
    students: studentsWithActivity,
    groups,
  });
};

export const studentWeeklyReports = async (req: Request, res: Response) => {
  try {
    const teacher_id = req.params.id;

    // 1. teacher ID
    const { data: teacher, error: teacherErr } = await supabase
      .from("teacher")
      .select("*")
      .eq("id", teacher_id)
      .single();

    if (teacherErr || !teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    const class_id = teacher.class_id;
    const { moodValue } = req.body;

    if (!class_id || moodValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "class_id and moodValue are required",
      });
    }

    const today = dayjs().endOf("day");
    const startDate = today.subtract(6, "day").startOf("day");

    // 1️ Fetch last 7 days mood activity

    const { data, error } = await supabase
      .from("student_activity")
      .select(
        `
        id,
        value,
        created_at,
        student_id,
        student!inner(username,class_id)
      `
      )
      .eq("value", moodValue)
      .eq("student.class_id", class_id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase query failed",
        details: error,
      });
    }

    // 2️ Prepare last 7 days structure with all zeros

    const last7Days: Record<string, { value: number; names: string[] }> = {};

    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, "day").format("YYYY-MM-DD");
      last7Days[date] = { names: [], value: 0 };
    }

    // 3️ Count moods per day
    console.log(data);
    data?.forEach((item: any) => {
      const date = dayjs(item.created_at).format("YYYY-MM-DD");
      if (last7Days.hasOwnProperty(date)) {
        last7Days[date].value += 1;
        last7Days[date].names.push(item.student.username);
      }
    });

    // 4️ Response

    return res.status(200).json({
      success: true,
      class_id,
      moodValue,
      last7Days,
    });
  } catch (err: any) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      details: err.message,
    });
  }
};

export const highestWeeklyMood = async (req: Request, res: Response) => {
  try {
    const teacher_id = req.params.id;

    // 1️ Get teacher → class
    const { data: teacher, error: teacherErr } = await supabase
      .from("teacher")
      .select("*")
      .eq("id", teacher_id)
      .single();

    if (teacherErr || !teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    const class_id = teacher.class_id;

    const today = dayjs().endOf("day");
    const startDate = today.subtract(6, "day").startOf("day");

    // 2️ Fetch all moods for last 7 days
    const { data, error } = await supabase
      .from("student_activity")
      .select(
        `
        id,
        value,
        created_at,
        student_id,
        student!inner(class_id)
      `
      )
      .eq("student.class_id", class_id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", today.toISOString());

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase query failed",
        details: error,
      });
    }

    // 3️ Count mood occurrences (0–11)
    const moodCounts: Record<number, number> = {};
    for (let i = 0; i <= 11; i++) {
      moodCounts[i] = 0;
    }

    data?.forEach((item) => {
      const mood = item.value;
      moodCounts[mood] += 1;
    });

    // 4️ Compute average (count / 7 days)
    let highestMood = { mood: 0, average: 0 };

    for (let i = 0; i <= 11; i++) {
      const avg = Number((moodCounts[i] / 7).toFixed(2));

      if (avg > highestMood.average) {
        highestMood = { mood: i, average: avg };
      }
    }

    // 5️ Return only the highest average mood
    return res.status(200).json({
      success: true,
      class_id,
      highestMood,
    });
  } catch (err: any) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      details: err.message,
    });
  }
};
