import mongoose, { Schema } from "mongoose";

const userShowcaseSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    quest_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    is_visible_for_showcase: {
        type: Boolean,
        default: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, collection: 'userShowcase' }
);

userShowcaseSchema.index({ location: "2dsphere" });
const userShowcaseModel = mongoose.model("userShowcase", userShowcaseSchema);
export default userShowcaseModel;
