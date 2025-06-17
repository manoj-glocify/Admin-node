import {Router} from "express";
import {body} from "express-validator";
import {
  profileLists,
  createUser,
  getUserById,
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

export const userRoutes = router;
