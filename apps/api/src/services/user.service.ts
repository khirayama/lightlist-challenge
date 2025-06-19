import { PrismaClient } from "@prisma/client";
import type { UpdateProfileRequest } from "../types/user.js";
import type { SettingsUpdateRequest } from "../types/auth.js";

const prisma = new PrismaClient();

export class UserService {
  async updateProfile(userId: string, data: UpdateProfileRequest) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { user: updatedUser };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  }

  // UsersControllerとの互換性のためのエイリアス
  async getUserProfile(userId: string) {
    return this.getProfile(userId);
  }

  async updateUserProfile(userId: string, data: UpdateProfileRequest) {
    return this.updateProfile(userId, data);
  }

  // 設定管理メソッド
  async getSettings(userId: string) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: {
        id: true,
        theme: true,
        language: true,
        taskInsertPosition: true,
        autoSort: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!settings) {
      throw new Error("Settings not found");
    }

    return { settings };
  }

  async updateSettings(userId: string, data: SettingsUpdateRequest) {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        theme: data.theme,
        language: data.language,
        taskInsertPosition: data.taskInsertPosition,
        autoSort: data.autoSort,
      },
      create: {
        userId,
        theme: data.theme || "system",
        language: data.language || "ja",
        taskInsertPosition: data.taskInsertPosition || "top",
        autoSort: data.autoSort || false,
      },
      select: {
        id: true,
        theme: true,
        language: true,
        taskInsertPosition: true,
        autoSort: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { settings };
  }
}