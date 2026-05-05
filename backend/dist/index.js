"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 4000);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/api/auth", auth_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/tasks", tasks_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "team-task-manager-api" });
});
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
