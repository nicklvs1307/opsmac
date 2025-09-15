const express = require("express");
const rateLimit = require("express-rate-limit");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const authController = require("domains/auth/auth.controller")(db);
  const { auth } = require("../../middleware/authMiddleware")(db);
  const {
    loginValidation,
    registerValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateProfileValidation,
    changePasswordValidation,
  } = require("domains/auth/auth.validation");

  const router = express.Router();

  const authLimiter = rateLimit({
    windowMs: (process.env.AUTH_RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.AUTH_RATE_LIMIT_MAX || 20,
    message: {
      error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: User login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Successful login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *       400:
   *         description: Invalid credentials or validation errors
   *       429:
   *         description: Too many login attempts
   */
  router.post(
    "/login",
    authLimiter,
    ...loginValidation,
    asyncHandler(authController.login),
  );

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user and create a new restaurant
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *               - restaurantName
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               restaurantName:
   *                 type: string
   *     responses:
   *       201:
   *         description: User and restaurant created successfully
   *       400:
   *         description: Validation errors
   *       409:
   *         description: Email or restaurant name already exists
   */
  router.post(
    "/register",
    ...registerValidation,
    asyncHandler(authController.register),
  );

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Request a password reset link
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *     responses:
   *       200:
   *         description: Password reset email sent (or simulated)
   *       400:
   *         description: Validation errors
   *       404:
   *         description: User not found
   */
  router.post(
    "/forgot-password",
    ...forgotPasswordValidation,
    asyncHandler(authController.forgotPassword),
  );

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Reset password using a token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - newPassword
   *             properties:
   *               token:
   *                 type: string
   *               newPassword:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Password reset successfully
   *       400:
   *         description: Validation errors or invalid/expired token
   */
  router.post(
    "/reset-password",
    ...resetPasswordValidation,
    asyncHandler(authController.resetPassword),
  );

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current authenticated user's profile
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *       401:
   *         description: Unauthorized
   */
  router.get("/me", auth, asyncHandler(authController.getMe));

  /**
   * @swagger
   * /auth/profile:
   *   put:
   *     summary: Update current authenticated user's profile
   *   tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               phone:
   *                 type: string
   *               avatar:
   *                 type: string
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *       400:
   *         description: Validation errors
   *       401:
   *         description: Unauthorized
   */
  router.put(
    "/profile",
    auth,
    ...updateProfileValidation,
    asyncHandler(authController.updateProfile),
  );

  /**
   * @swagger
   * /auth/change-password:
   *   put:
   *     summary: Change current authenticated user's password
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 format: password
   *               newPassword:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Validation errors or current password incorrect
   *       401:
   *         description: Unauthorized
   */
  router.put(
    "/change-password",
    auth,
    ...changePasswordValidation,
    asyncHandler(authController.changePassword),
  );

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: User logout (client-side token deletion)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   */
  router.post("/logout", auth, asyncHandler(authController.logout));

  return router;
};