import { Router } from "express";
import routeMiddlewares from "../../middleware/authMiddleware";
import { showcaseSchema } from "../../schemaValidation/quest";
import { showcaseQuest } from "../../controllers/quest/asset";

const router = Router();

router.post(
    "/",
    routeMiddlewares.authorize,
    routeMiddlewares.validateRequest(showcaseSchema),
    showcaseQuest
);
export default router;