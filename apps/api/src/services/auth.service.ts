import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  RequestPasswordResetRequest, 
  ResetPasswordRequest, 
  PasswordResetResponse 
} from "../types/auth.js";
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

  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<PasswordResetResponse> {
    const { email } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      // セキュリティ上、ユーザーが存在しなくても成功レスポンスを返す
      console.log(`❌ Password reset requested for non-existent email: ${email}`);
      return {
        message: "If an account with that email exists, a password reset link has been sent",
      };
    }

    console.log(`✅ User found for email: ${email}, generating reset token...`);

    // 既存の未使用トークンを無効化
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        used: true,
      },
    });

    // 新しいトークンを生成
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間後

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 開発環境では、トークンをコンソールに出力
    console.log(`\n🔑 PASSWORD RESET TOKEN GENERATED:`);
    console.log(`📧 Email: ${email}`);
    console.log(`🎫 Token: ${token}`);
    console.log(`🔗 Reset URL: http://localhost:3000/reset-password?token=${token}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(``);

    return {
      message: "If an account with that email exists, a password reset link has been sent",
    };
  }

  async resetPassword(data: ResetPasswordRequest): Promise<PasswordResetResponse> {
    const { token, password } = data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      console.log(`❌ Password reset failed: Invalid or expired token (${token.substring(0, 8)}...)`);
      throw new Error("Invalid or expired token");
    }

    console.log(`✅ Valid reset token found for user: ${resetToken.user.email}`);

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーのパスワードを更新
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // トークンを使用済みにマーク
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    console.log(`🎉 Password successfully reset for user: ${resetToken.user.email}`);

    return {
      message: "Password has been reset successfully",
    };
  }
}
