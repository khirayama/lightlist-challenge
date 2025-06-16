import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth.js";
import { generateToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        settings: {
          create: {
            theme: "system",
            language: "ja",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user,
      token,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }
}
