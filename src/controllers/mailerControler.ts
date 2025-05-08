import express from "express";
import { Request, Response } from "express";
import schedule from "node-schedule";
import { CustomRequest } from "../middlewares/token-decode";
import sendEmail from "../helpers/mailer";
import { Mail } from "../models/mailModel";
import path from "path";

// Define response types
interface MailResponse {
  message: string;
  data?: any;
  error?: string;
}

const BASE_URL = process.env.BASE_URL;

export const send = async (
  req: CustomRequest,
  res: Response<MailResponse>
): Promise<Response<MailResponse>> => {
  try {
    const userId = req.user?.id;

    const { to, subject, message, scheduledDate, time } = req.body;
    const files = req.files as Express.Multer.File[];
    if (!to || !subject || !message) {
      return res.status(400).json({
        message: "Missing required fields: to, subject, or message",
      });
    }

    if (!userId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const attachments = files
      ? files.map((file) => ({
          filename: file.originalname,
          path: file.path,
          url: `${BASE_URL}/uploads/${path.basename(file.path)}`,
        }))
      : [];
    const newmail = new Mail({
      userId,
      to,
      subject,
      message, 
      scheduledDate,
      time,
      attachments,
    });
    await newmail.save();
    if (scheduledDate) {
      return res.status(201).json({
        message: "Email scheduled successfully",
        data: {
          ...newmail.toObject(),
          attachments: attachments.map((att) => ({
            filename: att.filename,
            url: att.url,
          })),
        },
      });
    } else {
      await sendEmail(to, subject, message, attachments);
      return res.status(201).json({
        message: "Email sent successfully",
        data: {
          ...newmail.toObject(),
          attachments: attachments.map((att) => ({
            filename: att.filename,
            url: att.url,
          })),
        },
      });
    }
  } catch (error) {
    console.error("Error in send function:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const checkAndSendScheduledEmails = async (
  req: CustomRequest,
  res: Response<MailResponse>
): Promise<Response<MailResponse>> => {
  try {
    const currentDate = new Date();
    console.log("Current Date:", currentDate.toISOString().split("T")[0]);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTimeString = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    const scheduledEmails = await Mail.find({
      status: "pending",
      scheduledDate: currentDate.toISOString().split("T")[0],
    });
    console.log("Scheduled Emails:", scheduledEmails);

    const sentEmails = [];

    for (const email of scheduledEmails) {
      console.log("Sending email ID:", email._id);
      try {
        await sendEmail(email.to, email.subject, email.message);
        await Mail.findByIdAndUpdate(email._id, { status: "sent" });
        sentEmails.push(email);
      } catch (error) {
        console.error(`Failed to send email ID ${email._id}:`, error);
      }
    }

    return res.status(200).json({
      message: `${sentEmails.length} scheduled emails sent successfully`,
      data: sentEmails,
    });
  } catch (error) {
    console.error("Error in checkAndSendScheduledEmails:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const startEmailScheduler = (): schedule.Job => {
  console.log("Email scheduler started");
  return schedule.scheduleJob("* * * * *", async () => {
    try {
      const currentDate = new Date();
      console.log("Checking scheduled emails at:", currentDate);
      const formattedDate = currentDate.toISOString().split("T")[0];
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      const currentTimeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      console.log("Current time:", currentTimeString);
      const scheduledEmails = await Mail.find({
        status: "pending",
        scheduledDate: formattedDate,
        time: currentTimeString,
      });
      console.log("Found scheduled emails:", scheduledEmails.length);
      for (const email of scheduledEmails) {
        try {
          console.log("Attempting to send email:", email._id);
          await sendEmail(
            email.to,
            email.subject,
            email.message,
            email.attachments
          );
          await Mail.findByIdAndUpdate(email._id, {
            status: "sent",
            sentAt: new Date(),
          });
          console.log(`Email sent successfully: ${email._id}`);
        } catch (error) {
          console.error(`Failed to send email ${email._id}:`, error);
          await Mail.findByIdAndUpdate(email._id, {
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      console.error("Error in email scheduler:", error);
    }
  });
};
