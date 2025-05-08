import { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";
import generateToken from "../helpers/token";
import { comparePassword, hashPassword } from "../helpers/hased";

export const signUp = async (
  req: Request,
  res: Response,
  Next: NextFunction
) => {
  try {
    const { name, email, password, confirmpassword, mobileNumber } = req.body;
    if (!name || !email || !password || !confirmpassword || !mobileNumber) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const user_exist = await userModel.findOne({ email });
    if (user_exist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({
        message: "password and confirm password must be a same",
      });
    }
    const hansedpassword = await hashPassword(String(password));
    console.log("hased password", hansedpassword);

    const newUser = new userModel({
      name,
      email,
      password: hansedpassword,
      mobileNumber,
    });
    console.log("user", newUser);

    const tokenUser = {
      _id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      mobileNumber: newUser.mobileNumber,
    };

    const token = generateToken(tokenUser);

    newUser.token = token;
    newUser.save();

    return res.status(200).json({
      user: newUser,
      message: "Succesfully created",
      status: 200,
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(404).json({
      error: error.message,
      message: "Unsuccessful",
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
    if (role == "doctor") {
      return res.status(200).json({
        status: 200,
        message: "Login successful as Doctor",
        user: user,
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Login successful as user ",
        user: user,
      });
    }
  } catch (err: any) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message,
    });
  }
};
