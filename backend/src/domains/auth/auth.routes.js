import express from "express";
import rateLimit from "express-rate-limit";
import asyncHandler from "../../utils/asyncHandler.js";
import authControllerFactory from "./auth.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "./auth.validation.js";

export default (db) => {
  const authController = authControllerFactory(db);
  const { auth } = authMiddleware(db);
  const router = express.Router();

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  });

  router.post(
    "/register",
    registerValidation,
    asyncHandler(authController.register),
  );
  router.post(
    "/login",
    loginLimiter,
    loginValidation,
    asyncHandler(authController.login),
  );
  router.post(
    "/forgot-password",
    forgotPasswordValidation,
    asyncHandler(authController.forgotPassword),
  );
  router.post(
    "/reset-password",
    resetPasswordValidation,
    asyncHandler(authController.resetPassword),
  );
  router.get("/me", auth, asyncHandler(authController.getMe));
  router.put(
    "/me",
    auth,
    updateProfileValidation,
    asyncHandler(authController.updateProfile),
  );
  router.put(
    "/change-password",
    auth,
    changePasswordValidation,
    asyncHandler(authController.changePassword),
  );
  router.post("/logout", auth, asyncHandler(authController.logout));

  return router;
};
