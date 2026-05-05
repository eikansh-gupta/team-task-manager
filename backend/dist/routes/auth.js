"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(["ADMIN", "MEMBER"]).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6),
});
router.post("/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
    }
    const { email, name, password, role } = parsed.data;
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role ?? "MEMBER",
        },
    });
    const token = (0, jwt_1.signToken)({
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
    });
    return res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});
router.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = (0, jwt_1.signToken)({
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
    });
    return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});
router.get("/me", auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return res.json(user);
});
exports.default = router;
