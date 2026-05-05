import type { Role } from "./roles";

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
  name: string;
};
