import mongoose from "mongoose";
import { model } from "mongoose";
interface User {
  name: string;
  email: string;
  password: string;
  mobileNumber: number;
  role: string;
  isDeleted: boolean;
  token: string;
}

const User = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
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
    mobileNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
const UserModel = model<User>("User", User);
export default UserModel;
