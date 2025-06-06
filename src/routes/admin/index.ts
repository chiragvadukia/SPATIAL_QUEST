import { Router } from "express";
import { handleMulterErrors, imgUpload } from "../../helpers/fileUpload";
import routeMiddlewares from "../../middleware/authMiddleware";
import { addQuest, addQuestAsset, lisQuest, login } from "../../controllers/admin";
import { loginSchema, questAssetSchema, questSchema } from "../../schemaValidation/admin";


const router = Router();
router.post(
    "/login",
    routeMiddlewares.validateRequest(loginSchema),
    login
);
router.post(
    "/addQuest",
    imgUpload.single("quest"),
    handleMulterErrors,
    routeMiddlewares.authorizeAdmin,
    routeMiddlewares.validateRequest(questSchema),
    addQuest
);
router.post(
    "/addQuestAsset",
    imgUpload.single("quest"),
    handleMulterErrors,
    routeMiddlewares.authorizeAdmin,
    routeMiddlewares.validateRequest(questAssetSchema),
    addQuestAsset
);
router.get(
    "/list",
    routeMiddlewares.authorizeAdmin,
    lisQuest
);

export default router;