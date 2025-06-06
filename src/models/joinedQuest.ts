import mongoose, { Schema } from "mongoose";

const joinedQuestSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    quest_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    is_joined: {
        type: Boolean,
        default: true,
    },
    joined_at: {
        type: Date,
        default: new Date(),
        require: true
    },
    left_at: {
        type: Date,
        default: new Date(),
        require: false
    },
    joined_location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    is_completed: {
        type: Boolean,
        default: false,
    },
    completed_at: {
        type: Date,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, collection: 'joinedQuest' }
);
joinedQuestSchema.index({ joined_location: "2dsphere" });
const joinedQuestModel = mongoose.model("joinedQuest", joinedQuestSchema);
export default joinedQuestModel;
