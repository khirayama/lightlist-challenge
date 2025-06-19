import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import taskListRoutes from "./routes/task-lists.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 100,
});
app.use("/api", limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Lightlist API!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/task-lists", taskListRoutes);
app.use("/api", taskRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server is running on http://0.0.0.0:${PORT}`);
});
