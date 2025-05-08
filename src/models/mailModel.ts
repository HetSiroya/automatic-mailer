import mongoose from "mongoose";
import { model } from "mongoose";

interface mail {
  userId: mongoose.Schema.Types.ObjectId;
  to: string;
  message: string;
  subject: string;
  scheduledDate: string;
  time: string;
  status: {
    type: string;
    enum: ["pending", "sent"];
    default: "pending";
  };
  sentAt: Date;
  attachments: [
    {
      filename: string;
      path: string;
    }
  ];
}

const mailSchema = new mongoose.Schema<mail>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: String,
      required: false,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    // Add these fields to your schema
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    sentAt: {
      type: Date,
    },
    attachments: [
      {
        filename: {
          type: String,
        },
        path: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Mail = model("Mail", mailSchema);
