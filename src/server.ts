import express, { Request, Response } from "express";
import routes from "./routes";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/hello", (req: Request, res: Response) => {
  console.log("called hello api");
  res.json({ message: "Hello API working!" });
});
app.use("/api", routes);


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
