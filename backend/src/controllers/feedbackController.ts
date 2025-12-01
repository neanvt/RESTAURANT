import { Request, Response } from "express";
import Feedback from "../models/Feedback";

/**
 * Create new feedback
 */
export const createFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // For public submissions, outletId comes from request body
    // For authenticated submissions, it comes from middleware
    const outletId = req.body.outletId || req.outlet?._id;
    const { name, phone, feedback, rating } = req.body;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Outlet ID is required",
        },
      });
      return;
    }

    // Validation
    if (!name || !phone || !rating) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, phone, and rating are required",
        },
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Rating must be between 1 and 5",
        },
      });
      return;
    }

    // Create feedback
    const newFeedback = await Feedback.create({
      outletId,
      name,
      phone,
      feedback,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: newFeedback,
    });
  } catch (error: any) {
    console.error("Create feedback error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to submit feedback",
      },
    });
  }
};

/**
 * Get all feedbacks for current outlet
 */
export const getFeedbacks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outlet._id;
    const { startDate, endDate, minRating, maxRating } = req.query;

    // Build query
    const query: any = { outletId };

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Rating filter
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseInt(minRating as string);
      if (maxRating) query.rating.$lte = parseInt(maxRating as string);
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 }).lean();

    // Calculate statistics
    const totalFeedbacks = feedbacks.length;
    const averageRating =
      totalFeedbacks > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
        : 0;

    const ratingDistribution = {
      1: feedbacks.filter((f) => f.rating === 1).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      5: feedbacks.filter((f) => f.rating === 5).length,
    };

    res.json({
      success: true,
      data: {
        feedbacks,
        statistics: {
          total: totalFeedbacks,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
        },
      },
    });
  } catch (error: any) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch feedbacks",
      },
    });
  }
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outlet._id;

    const feedback = await Feedback.findOne({
      _id: id,
      outletId,
    });

    if (!feedback) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Feedback not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    console.error("Get feedback by ID error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch feedback",
      },
    });
  }
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outlet._id;

    const feedback = await Feedback.findOneAndDelete({
      _id: id,
      outletId,
    });

    if (!feedback) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Feedback not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to delete feedback",
      },
    });
  }
};
