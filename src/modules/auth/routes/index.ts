import {Router} from "express";
import passport from "passport";
import {body} from "express-validator";
import {authenticate} from "../../../middleware/authenticate";
import {
  register,
  login,
  googleCallback,
  logout,
  changePassword,
  requestPasswordReset,
  resetPassword,
  dashboardData,
  profileLists,
} from "../controllers/authController";
import {validateRequest} from "../../../middleware/validateRequest";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 */
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({min: 6}),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    validateRequest,
  ],
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
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
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    validateRequest,
  ],
  login
);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth login
 */
router.get(
  "/google",
  passport.authenticate("google", {scope: ["profile", "email"]})
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {session: false}),
  googleCallback
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change user password
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
 *               newPassword:
 *                 type: string
 */
router.post("/change-password", authenticate, changePassword);

/**
 * @swagger
 * /auth/request-reset:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
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
 */
router.post("/request-reset", requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
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
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [dashboard]
 *     summary: Get dashboard information
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", authenticate, dashboardData);

/**
 * @swagger
 * /userlists:
 *   get:
 *     tags: [userlists]
 *     summary: Get userlists information
 *     security:
 *       - bearerAuth: []
 */
router.get("/userlists", authenticate, profileLists);

export const authRoutes = router;
