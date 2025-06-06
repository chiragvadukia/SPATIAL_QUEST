import { Router } from "express";
import { signOut, signupUser } from "../../controllers/authentication/authorization";
import routeMiddlewares from "../../middleware/authMiddleware";
import { userSignupSchema } from "../../schemaValidation/authentication";

const router = Router();

router.post(
    "/signUp",
    routeMiddlewares.validateRequest(userSignupSchema),
    signupUser
);
router.post(
    "/signOut",
    routeMiddlewares.authorize,
    signOut
);
export default router;