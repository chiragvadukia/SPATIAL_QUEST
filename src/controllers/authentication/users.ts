import catchAsync from "../../helpers/carchAsync";
import { Response } from "express";
import { errorRequest, internalServerError, successfulRequest } from "../../helpers/commonFunction";
import { logger, level } from "../../config/logger";
import messages from "../../config/messages";
import joinedQuestModel from "../../models/joinedQuest";

// * GET JOINED QUEST
export const getJoinedQuest = catchAsync(
    async (req: any, res: Response) => {
        const userData = req.app.locals.userData;
        try {
            if (!userData._id) {
                return errorRequest(res, { data: null, message: messages['invalid_id'] });
            }
            const questData = await joinedQuestModel.aggregate([
                {
                    $match: {
                        user_id: userData._id,
                        is_joined: true,
                        is_deleted: false
                    }
                },
                {
                    $lookup: {
                        from: 'quest',
                        localField: 'quest_id',
                        foreignField: '_id',
                        as: 'quest'
                    }
                },
                { $unwind: "$quest" },
                {
                    $lookup: {
                        from: 'userShowcase',
                        localField: 'quest_id',
                        foreignField: 'quest_id',
                        as: 'userShowcase'
                    }
                },
                {
                    $lookup: {
                        from: 'questAsset',
                        localField: 'quest_id',
                        foreignField: 'quest_id',
                        as: 'assets'
                    }
                },
                {
                    $lookup: {
                        from: 'questParticipant',
                        let: { questId: "$quest_id", userId: "$user_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$quest_id", "$$questId"] },
                                            { $eq: ["$user_id", "$$userId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'collectedAssets'
                    }
                },
                {
                    $addFields: {
                        total_assets: { $size: "$assets" },
                        collected_assets: { $size: "$collectedAssets" },
                        remaining_assets: { $subtract: [{ $size: "$assets" }, { $size: "$collectedAssets" }] },
                        visible_to_public: {
                            $cond: {
                                if: { $gt: [{ $size: "$userShowcase" }, 0] },
                                then: {
                                    $eq: [{ $arrayElemAt: ["$userShowcase.is_visible_for_showcase", 0] }, true]
                                },
                                else: false
                            }
                        }
                    }
                },
                {
                    $project: {
                        quest_id: 1,
                        joined_at: 1,
                        "quest_name": "$quest.quest_name",
                        quest_media: { $concat: [process.env.BASE_URL, "public/quest", "$quest.quest_media"] },
                        total_assets: 1,
                        collected_assets: 1,
                        remaining_assets: 1,
                        visible_to_public: 1,
                        is_completed: 1,
                    }
                }
            ]);

            return successfulRequest(res, {
                data: questData,
                message: messages['data_found']
            });

        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);
