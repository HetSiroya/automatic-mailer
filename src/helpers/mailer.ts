import express from "express";

import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  service: process.env.Service,
  host: process.env.Host,
  auth: {
    user: process.env.User,
    pass: process.env.Pass,
  },
  secure: process.env.Secure,
  port: process.env.Email_Port,
} as SMTPTransport.Options);

const sendEmail = async (
  to: string,
  subject: string,
  message: string,
  attachments?: { filename: string; path: string }[]
) => {
  try {
    const mailOptions = {
      from: process.env.User,
      to,
      subject,
      text: message,
      attachments: attachments || [],
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email");
  }
};

export default sendEmail;
