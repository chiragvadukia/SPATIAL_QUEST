import { Router, Request, Response } from "express";
import authRoutes from "./authentication";
import userRoutes from "./user";
import questRoutes from "./quest";
import adminRoutes from "./admin";
import assetRoutes from "./asset";
const router = Router();

/**
 * @description API CHECK
 */
router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ msg: "API is Working Fine!" });
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/quests", questRoutes);
router.use("/assets", assetRoutes);
router.use("/admin", adminRoutes);

export default router;
