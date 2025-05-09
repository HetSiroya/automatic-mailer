import { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";
import generateToken from "../helpers/token";
import { comparePassword, hashPassword } from "../helpers/hased";
import { CustomRequest } from "../middlewares/token-decode";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, confirmpassword, mobileNumber } = req.body;
    const profilePicture = req.file?.path; // Get uploaded file path

    if (!name || !email || !password || !confirmpassword || !mobileNumber) {
      return res.status(400).json({
        status: 400,
        message: "All fields are required",
        data: "",
      });
    }
    const user_exist = await userModel.findOne({ email });
    if (user_exist) {
      return res.status(400).json({
        status: 400,
        message: "User already exists",
        data: "",
      });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({
        status: 400,
        message: "password and confirm password must be a same",
        data: "",
      });
    }
    const hansedpassword = await hashPassword(String(password));
    console.log("hased password", hansedpassword);

    const newUser = new userModel({
      name,
      email,
      password: hansedpassword,
      mobileNumber,
      profilePicture: profilePicture || "", // Add profile picture path
    });

    const tokenUser = {
      _id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      mobileNumber: newUser.mobileNumber,
    };

    const token = generateToken(tokenUser);
    newUser.token = token;
    await newUser.save();

    return res.status(200).json({
      message: "Successfully created",
      status: 200,
      data: {
        ...newUser.toObject(),
        profilePicture: profilePicture
          ? `/uploads/profiles/${profilePicture.split("\\").pop()}`
          : "",
      },
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(404).json({
      status: 404,
      error: error.message,
      message: "Unsuccessful",
      data: "",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
        data: "",
      });
    }
    const role = user.role;
    const check = await comparePassword(
      String(password),
      String(user.password)
    );
    console.log("check", check);
    if (!check) {
      return res.status(400).json({
        status: 400,
        message: "Auth fail",
        data: "",
      });
    }

    const tokenUser = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      mobileNumber: user.mobileNumber,
      role: role,
    };

    const token = generateToken(tokenUser);
    user.token = token;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Login Succesfully",
      data: user,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(400).json({
      status: 404,
      message: err.message,
      data: "",
    });
  }
};
