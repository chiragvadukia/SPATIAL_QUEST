import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    email_id: {
        type: String,
        require: false
    },
    password: {
        type: String,
        require: false,
        default: null
    },
    app_version: {
        type: String,
        require: false
    },
    device_type: {
        type: String,
        require: false
    },
    device_id: {
        type: String,
        require: false
    },
    fcm_token: {
        type: String,
        require: false
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    last_activity_date: {
        type: Date,
        require: false
    },

}, { timestamps: true, collection: 'users' }
);

const userModel = mongoose.model("users", userSchema);
export default userModel;
