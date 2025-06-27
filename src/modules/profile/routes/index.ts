import {Router} from "express";
import {body} from "express-validator";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePic,
} from "../controllers/profileController";
import {validateRequest} from "../../../middleware/validateRequest";
import {authenticate} from "../../../middleware/authenticate";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({storage});
const router = Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
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
  "/",
  authenticate,
  [
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("email").optional().isEmail().normalizeEmail(),
    validateRequest,
  ],
  updateProfile
);

/**
 * @swagger
 * /profile/change-password:
 *   post:
 *     tags: [Profile]
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
 *                 minLength: 6
 */
router.post(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({min: 6}),
    validateRequest,
  ],
  changePassword
);

router.put(
  "/update-pic",
  authenticate,
  upload.single("image"),
  updateProfilePic
);

export const profileRoutes = router;
