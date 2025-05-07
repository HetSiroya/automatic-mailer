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

const sendEmail = async (
  to: string, 
  subject: string, 
  message: string, 
  attachments?: { filename: string; path: string; }[]
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text: message,
      attachments: attachments || []
    };

    return await transporter.sendMail(mailOptions);
  }
  catch (error) {
    console.error("Error sending email")}
    
}


  export default sendEmail;
