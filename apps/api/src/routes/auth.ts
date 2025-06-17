import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { 
  loginSchema, 
  registerSchema, 
  requestPasswordResetSchema, 
  resetPasswordSchema,
  refreshTokenSchema, 
  validate 
} from "../middlewares/validation.js";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(registerSchema), async (req, res) => {
  await authController.register(req, res);
});

router.post("/login", validate(loginSchema), async (req, res) => {
  await authController.login(req, res);
});

router.post("/logout", async (req, res) => {
  await authController.logout(req, res);
});

router.post("/request-password-reset", validate(requestPasswordResetSchema), async (req, res) => {
  await authController.requestPasswordReset(req, res);
});

router.post("/reset-password", validate(resetPasswordSchema), async (req, res) => {
  await authController.resetPassword(req, res);
});

router.post("/refresh", validate(refreshTokenSchema), async (req, res) => {
  await authController.refreshToken(req, res);
});

export default router;
