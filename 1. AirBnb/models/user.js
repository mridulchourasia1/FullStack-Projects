import mongoose from 'mongoose';
const { Schema } = mongoose;
import passportLocalMongoose from 'passport-local-mongoose';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    //email: { type: String, required: true, unique: true },
    //password: { type: String, required: true },
    //role: { type: String, enum: ['user', 'admin'], default: 'user' },
   // createdAt: { type: Date, default: Date.now }
});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
