const express = require("express");
const rateLimit = require("express-rate-limit");
const asyncHandler = require("utils/asyncHandler");

module.exports = (db) => {
  const authController = require("domains/auth/auth.controller")(db);
  const {
    loginValidation,
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
  router.get("/me", asyncHandler(authController.getMe));

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
  router.post("/logout", asyncHandler(authController.logout));

  return router;
};