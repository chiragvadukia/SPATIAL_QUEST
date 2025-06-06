import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email_id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true
    },
    is_deleted: {
        type: Boolean,
        required: true,
        default: false
    },

}, { timestamps: true, collection: 'admin' }
);

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
