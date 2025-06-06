import { Router } from "express";
import routeMiddlewares from "../../middleware/authMiddleware";
import { getJoinedQuest } from "../../controllers/authentication/users";

const router = Router();

router.get(
    "/questsList",
    routeMiddlewares.authorize,
    getJoinedQuest
);
export default router;