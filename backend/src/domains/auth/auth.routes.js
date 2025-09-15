import express from "express";
import rateLimit from "express-rate-limit";
import asyncHandler from "utils/asyncHandler";
import authControllerFactory from "domains/auth/auth.controller";
import { auth } from "middleware/authMiddleware";
import {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "domains/auth/auth.validation";

export default (db) => {
  const authController = authControllerFactory(db);
