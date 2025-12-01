import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  outletId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  feedback?: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
feedbackSchema.index({ outletId: 1, createdAt: -1 });
feedbackSchema.index({ rating: 1 });

const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default Feedback;
