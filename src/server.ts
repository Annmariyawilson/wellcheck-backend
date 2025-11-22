import express, { Request, Response } from "express";
import routes from "./routes";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://wellcheck-frontend.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/hello", (req: Request, res: Response) => {
  console.log("called hello api");
  res.json({ message: "Hello API working!" });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
