// AI controller removed. Image generation endpoints are disabled per project request.
import { Request, Response } from "express";

export const generateImage = async (_req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    error: {
      code: "DEPRECATED",
      message: "AI image generation has been removed from this API",
    },
  });
};
