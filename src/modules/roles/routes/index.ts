import {Router} from "express";
import {body} from "express-validator";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/roleController";
import {validateRequest} from "../../../middleware/validateRequest";
import {checkPermission} from "../../../middleware/checkPermission";
import {authenticate} from "../../../middleware/authenticate";

const router = Router();

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 */
router.post(
  "/",
  authenticate,
  checkPermission("roles", "create"),
  [
    body("name").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("isDefault").optional().isBoolean(),
    validateRequest,
  ],
  createRole
);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, checkPermission("admin", "read"), getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id", authenticate, checkPermission("roles", "read"), getRoleById);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 */
router.put(
  "/:id",
  authenticate,
  checkPermission("roles", "update"),
  [
    body("name").optional().trim().notEmpty(),
    body("description").optional().trim().notEmpty(),
    body("isDefault").optional().isBoolean(),
    validateRequest,
  ],
  updateRole
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
router.delete(
  "/:id",
  authenticate,
  checkPermission("roles", "delete"),
  deleteRole
);


export const roleRoutes = router;
