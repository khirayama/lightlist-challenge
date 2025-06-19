import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  RequestPasswordResetRequest, 
  ResetPasswordRequest, 
  PasswordResetResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from "../types/auth.js";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  getRefreshTokenExpiresAt,
  getAccessTokenExpiresAt 
} from "../utils/jwt.js";
import { generateDeviceInfoFromRequest } from "../utils/device.js";

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterRequest, userAgent: string, ipAddress: string): Promise<AuthResponse> {
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
        userSettings: {
          create: {
            theme: "system",
            language: "ja",
            taskInsertPosition: "top",
            autoSort: false,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const accessTokenExpiresAt = getAccessTokenExpiresAt();

    const refreshToken = generateRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

    // デバイス情報をサーバーサイドで生成
    const { deviceId, deviceName } = generateDeviceInfoFromRequest(userAgent, ipAddress);

    // リフレッシュトークンをデータベースに保存
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceId,
        deviceName,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      user,
      token: accessToken,
      refreshToken,
      expiresAt: accessTokenExpiresAt,
    };
  }

  async login(data: LoginRequest, userAgent: string, ipAddress: string): Promise<AuthResponse> {
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

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const accessTokenExpiresAt = getAccessTokenExpiresAt();

    const refreshToken = generateRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

    // デバイス情報をサーバーサイドで生成
    const { deviceId, deviceName } = generateDeviceInfoFromRequest(userAgent, ipAddress);

    // 同一デバイスの既存リフレッシュトークンのみ無効化
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        deviceId: deviceId,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        used: true,
      },
    });

    // デバイス数制限チェック（最大5台）
    const activeTokenCount = await prisma.refreshToken.count({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // 最大デバイス数を超える場合、最も古いトークンを無効化
    if (activeTokenCount >= 5) {
      const oldestTokens = await prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: activeTokenCount - 4, // 5台制限なので、4台残して削除
      });

      if (oldestTokens.length > 0) {
        await prisma.refreshToken.updateMany({
          where: {
            id: {
              in: oldestTokens.map(token => token.id),
            },
          },
          data: {
            used: true,
          },
        });
      }
    }

    // 新しいリフレッシュトークンを保存
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceId,
        deviceName,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: accessToken,
      refreshToken,
      expiresAt: accessTokenExpiresAt,
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

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken } = data;

    const storedRefreshToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedRefreshToken || storedRefreshToken.used || storedRefreshToken.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    // 現在のリフレッシュトークンを使用済みにマーク
    await prisma.refreshToken.update({
      where: { id: storedRefreshToken.id },
      data: { used: true },
    });

    // 新しいアクセストークンを生成
    const newAccessToken = generateAccessToken({
      userId: storedRefreshToken.user.id,
      email: storedRefreshToken.user.email,
    });
    const newAccessTokenExpiresAt = getAccessTokenExpiresAt();

    // 新しいリフレッシュトークンを生成
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenExpiresAt = getRefreshTokenExpiresAt();

    // 新しいリフレッシュトークンを保存（デバイス情報を継承）
    await prisma.refreshToken.create({
      data: {
        userId: storedRefreshToken.user.id,
        token: newRefreshToken,
        deviceId: storedRefreshToken.deviceId,
        deviceName: storedRefreshToken.deviceName,
        expiresAt: newRefreshTokenExpiresAt,
      },
    });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newAccessTokenExpiresAt,
    };
  }
}
