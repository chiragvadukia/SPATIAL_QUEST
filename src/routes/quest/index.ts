import { Router } from "express";
import routeMiddlewares from "../../middleware/authMiddleware";
import { collectQuestAsset, findQuest, findQuestAsset, joinQuest, leaveQuest } from "../../controllers/quest";
import { collectQuestSchema, joinQuestSchema, leaveQuestSchema, questSchema } from "../../schemaValidation/quest";

const router = Router();
router.get(
    "/",
    routeMiddlewares.authorize,
    routeMiddlewares.validateRequest(questSchema),
    findQuest
);
router.post(
    "/:quest_id/join",
    routeMiddlewares.authorize,
    routeMiddlewares.validateRequest(joinQuestSchema),
    joinQuest
);
router.post(
    "/:quest_id/leave",
    routeMiddlewares.authorize,
    routeMiddlewares.validateRequest(leaveQuestSchema),
    leaveQuest
);

router.get(
    "/asset",
    routeMiddlewares.authorize,
    routeMiddlewares.validateRequest(questSchema),
    findQuestAsset
);

router.post(
    "/:quest_id/collect",
    routeMiddlewares.authorize,
    routeMiddlewares.validateRequest(collectQuestSchema),
    collectQuestAsset
);


export default router;