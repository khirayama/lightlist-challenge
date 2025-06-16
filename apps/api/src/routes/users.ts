import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";
import { authenticateToken, requireOwnership } from "../middlewares/auth.js";
import { settingsUpdateSchema, userIdParamSchema, validate } from "../middlewares/validation.js";

const router = Router();
const usersController = new UsersController();

router.get(
  "/:userId/settings",
  validate(userIdParamSchema),
  authenticateToken,
  requireOwnership,
  async (req, res) => {
    await usersController.getSettings(req, res);
  },
);

router.put(
  "/:userId/settings",
  validate(userIdParamSchema),
  validate(settingsUpdateSchema),
  authenticateToken,
  requireOwnership,
  async (req, res) => {
    await usersController.updateSettings(req, res);
  },
);

router.get(
  "/:userId/profile",
  validate(userIdParamSchema),
  authenticateToken,
  requireOwnership,
  async (req, res) => {
    await usersController.getProfile(req, res);
  },
);

export default router;
