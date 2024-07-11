import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    clerkUserId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


if (mongoose.models.users) {
    
    delete mongoose.models.users;
    
}


const userModel = mongoose.model('users', userSchema);

export default userModel;