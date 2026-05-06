// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import helmet from "helmet";
// import morgan from "morgan";
// import authRoutes from "./routes/auth";
// import dashboardRoutes from "./routes/dashboard";
// import projectRoutes from "./routes/projects";
// import taskRoutes from "./routes/tasks";

// dotenv.config();

// const app = express();
// // const port = Number(process.env.PORT || 4000);

// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));

// app.use("/api/auth", authRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// app.get("/health", (_req, res) => {
//   res.status(200).json({ ok: true, service: "team-task-manager-api" });
// });

// // app.listen(port, () => {
// //   console.log(`API running at http://localhost:${port}`);
// // });

// const PORT = Number(process.env.PORT) || 4000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";

// ✅ Only load .env locally — Railway injects vars automatically
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "team-task-manager-api" });
});

// ✅ Use Railway's PORT — never hardcode
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});