import mongoose, { Schema } from "mongoose";

const loginTokenSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    role: {
        type: Number, //1-User, 2-admin
        required: true,
        default: 1
    }

}, { timestamps: true, collection: 'token' }
);
loginTokenSchema.index({ "token": 1 }, { expireAfterSeconds: 604800 }); // 1 week  expiry (24*60*60)

const loginTokenModel = mongoose.model("token", loginTokenSchema);
export default loginTokenModel;
