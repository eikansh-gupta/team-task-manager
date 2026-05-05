import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
}
