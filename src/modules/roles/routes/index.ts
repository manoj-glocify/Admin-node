import { Router } from 'express';
import { body } from 'express-validator';
import {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
} from '../controllers/roleController';
import { validateRequest } from '../../../middleware/validateRequest';
import { checkPermission } from '../../../middleware/checkPermission';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     module:
 *                       type: string
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *               isDefault:
 *                 type: boolean
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('permissions').isArray(),
    validateRequest,
    checkPermission('roles', 'create'),
  ],
  createRole
);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 */
router.get('/', checkPermission('roles', 'read'), getRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', checkPermission('roles', 'read'), getRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update role
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *               isDefault:
 *                 type: boolean
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('permissions').optional().isArray(),
    validateRequest,
    checkPermission('roles', 'update'),
  ],
  updateRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', checkPermission('roles', 'delete'), deleteRole);

export const roleRoutes = router; 