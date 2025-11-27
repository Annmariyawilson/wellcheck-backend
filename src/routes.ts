import { Router } from "express";
import {
  createUser,
  forgotPasswordStudent,
  getUsers,
  loginStudent,
  teacherResetStudentPassword,
} from "./controllers/userController";
import {
  createTeacher,
  forgotPasswordTeacher,
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
router.post("/student/forgot-password", forgotPasswordStudent);


// TEACHER ROUTES
router.post("/teacher/signup", createTeacher);
router.post("/teacher/login", loginTeacher);
router.get("/teacher/:id", getTeacherById);
router.post("/teacher/forgot-password", forgotPasswordTeacher);
router.post("/teacher/reset-student-password", teacherResetStudentPassword);

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
