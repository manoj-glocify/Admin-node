import {Router} from "express";
import {body} from "express-validator";
import {
  profileLists,
  createUser,
  getUserById,
  updateUserData,
  deleteUser,
} from "../controllers/userController";
import {validateRequest} from "../../../middleware/validateRequest";
import {authenticate} from "../../../middleware/authenticate";

const router = Router();

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

/**
 * @swagger
 * /newuser:
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
  "/create",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({min: 6}),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("roleId").trim().notEmpty(),
    validateRequest,
  ],
  createUser
);

/**
 * @swagger
 * /user:id:
 *   get:
 *     tags: [user:id]
 *     summary: Get user information by id
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, getUserById);

/**
 * @swagger
 * /update/user:
 *   put:
 *     tags: [user]
 *     summary: Update user info
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 */
router.put(
  "/update/:id",
  authenticate,
  [
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("email").optional().isEmail().normalizeEmail(),
    // body("isActive").optional().isBoolean().toBoolean,
    body("roleId").optional().trim().notEmpty(),
    validateRequest,
  ],
  updateUserData
);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/delete/:id", authenticate, deleteUser);

export const userRoutes = router;
