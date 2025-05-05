import express from "express";
import { Request, Response } from "express";
import schedule from "node-schedule";
import { CustomRequest } from "../middlewares/token-decode";
import sendEmail from "../helpers/mailer";
import { Mail } from "../models/mailModel";

export const send = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { to, subject, message, scheduledDate, time } = req.body;

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

    const newmail = new Mail({
      userId,
      to,
      subject,
      message,
      scheduledDate,
      time,
    });
    await newmail.save();

    res.status(201).json({
      message: "Email scheduled successfully",

      data: newmail,
    });
  } catch (error) {
    console.error("Error in send function:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const checkAndSendScheduledEmails = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTimeString = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    const scheduledEmails = await Mail.find({
      status: { $ne: "sent" },
      scheduledDate: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
        $lte: new Date(currentDate.setHours(23, 59, 59, 999)),
      },
      time: currentTimeString,
    });
    console.log("Scheduled Emails:", scheduledEmails);

    const sentEmails = [];

    for (const email of scheduledEmails) {
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

export const startEmailScheduler = () => {
  console.log("Email scheduler started");

  schedule.scheduleJob("* * * * *", async () => {
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
          await sendEmail(email.to, email.subject, email.message);
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
