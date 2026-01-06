import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isStudent: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: true, // All users are verified by default
  },
  studentId: {
    type: String, 
    required: true,
  },
  img: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  desc: {
    type: String,
    required: false,
  },
  isSeller: {
    type: Boolean,
    default:false
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  businessType: {
    type: String,
    enum: ["individual", "sole_proprietor", "llp", "company"],
    default: "individual",
  },
  registrationNumber: {
    type: String,
    required: false,
  },
  lockedUntil: {
    type: Date,
    required: false,
  },
},{
  timestamps:true
});

export default mongoose.model("User", userSchema)
