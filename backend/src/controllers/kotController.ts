import { Request, Response } from "express";
import KOT from "../models/KOT";

// Get all KOTs
export const getKOTs = async (req: Request, res: Response): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const { status, startDate, endDate } = req.query;

    const filter: any = { outletId };

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const kots = await KOT.find(filter)
      .populate("orderId", "orderNumber customer tableNumber")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: kots,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch KOTs" },
    });
  }
};

// Get single KOT
export const getKOT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const kot = await KOT.findOne({ _id: id, outletId })
      .populate("orderId", "orderNumber customer tableNumber total")
      .populate("createdBy", "name email");

    if (!kot) {
      res.status(404).json({
        success: false,
        error: { message: "KOT not found" },
      });
      return;
    }

    res.json({
      success: true,
      data: kot,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch KOT" },
    });
  }
};

// Update KOT item status
export const updateKOTItemStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { itemId, status } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    if (!itemId || !status) {
      res.status(400).json({
        success: false,
        error: { message: "Item ID and status are required" },
      });
      return;
    }

    if (!["pending", "preparing", "ready"].includes(status)) {
      res.status(400).json({
        success: false,
        error: { message: "Invalid status" },
      });
      return;
    }

    const kot = await KOT.findOne({ _id: id, outletId });

    if (!kot) {
      res.status(404).json({
        success: false,
        error: { message: "KOT not found" },
      });
      return;
    }

    // Find and update item status
    const item = kot.items.find((i: any) => i._id?.toString() === itemId);

    if (!item) {
      res.status(404).json({
        success: false,
        error: { message: "Item not found in KOT" },
      });
      return;
    }

    item.status = status;

    // Update KOT status based on items
    const allReady = kot.items.every((i) => i.status === "ready");
    const anyInProgress = kot.items.some(
      (i) => i.status === "preparing" || i.status === "ready"
    );

    if (allReady) {
      kot.status = "completed";
      kot.completedAt = new Date();
    } else if (anyInProgress) {
      kot.status = "in_progress";
    }

    await kot.save();

    res.json({
      success: true,
      data: kot,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update KOT item status" },
    });
  }
};

// Update KOT status
export const updateKOTStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        error: { message: "Status is required" },
      });
      return;
    }

    if (!["pending", "in_progress", "completed"].includes(status)) {
      res.status(400).json({
        success: false,
        error: { message: "Invalid status" },
      });
      return;
    }

    const kot = await KOT.findOne({ _id: id, outletId });

    if (!kot) {
      res.status(404).json({
        success: false,
        error: { message: "KOT not found" },
      });
      return;
    }

    kot.status = status;
    if (status === "completed") {
      kot.completedAt = new Date();
      // Update all items to ready
      kot.items.forEach((item) => {
        item.status = "ready";
      });
    }

    await kot.save();

    res.json({
      success: true,
      data: kot,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update KOT status" },
    });
  }
};

// Get KOTs by order
export const getKOTsByOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const kots = await KOT.find({ orderId, outletId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: kots,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch KOTs" },
    });
  }
};

// Print KOT
export const printKOT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const kot = await KOT.findOne({ _id: id, outletId })
      .populate("orderId", "orderNumber customer tableNumber")
      .populate("createdBy", "name email");

    if (!kot) {
      res.status(404).json({
        success: false,
        error: { message: "KOT not found" },
      });
      return;
    }

    // TODO: Implement actual printer integration here
    // For now, just return success
    console.log(`KOT ${kot.kotNumber} sent to printer`);

    res.json({
      success: true,
      message: "KOT sent to printer",
      data: kot,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to print KOT" },
    });
  }
};
