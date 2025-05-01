import express from "express";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "shiroyahet90@gmail.com",
    pass: "cujbmsosyrdmgxrs",
  },
  secure: true,
  port: 465,
});

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: "shiroyahet90@gmail.com",
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default sendEmail;
