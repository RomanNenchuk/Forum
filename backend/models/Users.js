import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String }, // URL до зображення аватара
  personalInfo: {
    bio: { type: String },
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().split("T")[0], // Формат YYYY-MM-DD
  },
});

const User = mongoose.model("User", userSchema);
export default User;
