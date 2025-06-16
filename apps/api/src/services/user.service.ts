import { PrismaClient } from "@prisma/client";
import type { SettingsUpdateRequest } from "../types/auth.js";

const prisma = new PrismaClient();

export class UserService {
  async getSettings(userId: string) {
    const settings = await prisma.settings.findUnique({
      where: { userId },
      select: {
        id: true,
        theme: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!settings) {
      throw new Error("Settings not found");
    }

    return settings;
  }

  async updateSettings(userId: string, data: SettingsUpdateRequest) {
    const existingSettings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      throw new Error("Settings not found");
    }

    const updatedSettings = await prisma.settings.update({
      where: { userId },
      data: {
        theme: data.theme ?? existingSettings.theme,
        language: data.language ?? existingSettings.language,
      },
      select: {
        id: true,
        theme: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedSettings;
  }

  async getUserProfile(userId: string) {
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

    return user;
  }
}
