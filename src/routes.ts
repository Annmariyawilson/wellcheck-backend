import { Router } from "express";
import {
  createUser,
  getUsers,
  loginStudent,
} from "./controllers/userController";
import {
  createTeacher,
  getTeacherById,
  loginTeacher,
} from "./controllers/teacherController";
import { createClass, getClasses } from "./controllers/classController";
import {
  createActivity,
  getStudentActivity,
} from "./controllers/studentActivityController";
import {
  getTeacherClassActivity,
  highestWeeklyMood,
  studentWeeklyReports,
} from "./controllers/teacherActivityController";

const router = Router();

router.post("/student-signup", createUser);
router.get("/students", getUsers);
router.post("/student/login", loginStudent);

// TEACHER ROUTES
router.post("/teacher/signup", createTeacher);
router.post("/teacher/login", loginTeacher);
router.get("/teacher/:id", getTeacherById);

router.get("/teacher/class-activity/:id", getTeacherClassActivity);
router.post("/teacher/class-weekly-activity/:id", studentWeeklyReports);
router.post("/teacher/class-highest-weekly/:id", highestWeeklyMood);

// CLASS ROUTES
router.post("/class", createClass);
router.get("/classes", getClasses);

// STUDENT ACTIVITY ROUTES
router.post("/student/activity", createActivity);
router.get("/student/activity/:id", getStudentActivity);

export default router;
