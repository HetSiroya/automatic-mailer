import express from "express";
import { Request, Response } from "express";

import { CustomRequest } from "../middlewares/token-decode";
import sendEmail from "../helpers/mailer";



export const send = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { to, subject, message } = req.body;
    if (!userId) {
    return res.status(404).json({
        message: "not found",
      });
    }
    const mail = sendEmail(to, subject, message);
    res.status(200).json({
      message: "email sent",
      data: "",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
