import { Request, Response } from "express";
import printerService from "../services/printerService";

/**
 * Create new printer
 */
export const createPrinter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const printer = await printerService.createPrinter({
      ...req.body,
      outletId,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Printer created successfully",
      data: printer,
    });
  } catch (error: any) {
    console.error("Error creating printer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create printer",
    });
    return;
  }
};

/**
 * Get all printers
 */
export const getPrinters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printers = await printerService.getPrinters(outletId);

    res.json({
      success: true,
      data: printers,
    });
  } catch (error: any) {
    console.error("Error fetching printers:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch printers",
    });
  }
};

/**
 * Get printer by ID
 */
export const getPrinterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printer = await printerService.getPrinterById(id, outletId);

    if (!printer) {
      res.status(404).json({
        success: false,
        message: "Printer not found",
      });
      return;
    }

    res.json({
      success: true,
      data: printer,
    });
  } catch (error: any) {
    console.error("Error fetching printer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch printer",
    });
  }
};

/**
 * Update printer
 */
export const updatePrinter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printer = await printerService.updatePrinter(id, outletId, req.body);

    if (!printer) {
      res.status(404).json({
        success: false,
        message: "Printer not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Printer updated successfully",
      data: printer,
    });
  } catch (error: any) {
    console.error("Error updating printer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update printer",
    });
  }
};

/**
 * Delete printer
 */
export const deletePrinter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const deleted = await printerService.deletePrinter(id, outletId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Printer not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Printer deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting printer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete printer",
    });
  }
};

/**
 * Update printer status
 */
export const updatePrinterStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;
    const { status } = req.body;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printer = await printerService.updatePrinterStatus(
      id,
      outletId,
      status
    );

    if (!printer) {
      res.status(404).json({
        success: false,
        message: "Printer not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Printer status updated",
      data: printer,
    });
  } catch (error: any) {
    console.error("Error updating printer status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update printer status",
    });
  }
};

/**
 * Set default printer
 */
export const setDefaultPrinter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printer = await printerService.setDefaultPrinter(id, outletId);

    if (!printer) {
      res.status(404).json({
        success: false,
        message: "Printer not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Default printer set",
      data: printer,
    });
  } catch (error: any) {
    console.error("Error setting default printer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to set default printer",
    });
  }
};

/**
 * Create print job
 */
export const createPrintJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printJob = await printerService.createPrintJob({
      ...req.body,
      outletId,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Print job created successfully",
      data: printJob,
    });
  } catch (error: any) {
    console.error("Error creating print job:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create print job",
    });
  }
};

/**
 * Get print jobs
 */
export const getPrintJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const filters: any = {};
    if (req.query.printerId) filters.printerId = req.query.printerId as string;
    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.limit) filters.limit = parseInt(req.query.limit as string);

    const printJobs = await printerService.getPrintJobs(outletId, filters);

    res.json({
      success: true,
      data: printJobs,
    });
  } catch (error: any) {
    console.error("Error fetching print jobs:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch print jobs",
    });
  }
};

/**
 * Update print job status
 */
export const updatePrintJobStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;
    const { status, error } = req.body;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printJob = await printerService.updatePrintJobStatus(
      id,
      outletId,
      status,
      error
    );

    if (!printJob) {
      res.status(404).json({
        success: false,
        message: "Print job not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Print job status updated",
      data: printJob,
    });
  } catch (error: any) {
    console.error("Error updating print job status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update print job status",
    });
  }
};

/**
 * Retry print job
 */
export const retryPrintJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printJob = await printerService.retryPrintJob(id, outletId);

    if (!printJob) {
      res.status(404).json({
        success: false,
        message: "Print job not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Print job retried",
      data: printJob,
    });
  } catch (error: any) {
    console.error("Error retrying print job:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retry print job",
    });
  }
};

/**
 * Cancel print job
 */
export const cancelPrintJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printJob = await printerService.cancelPrintJob(id, outletId);

    if (!printJob) {
      res.status(404).json({
        success: false,
        message: "Print job not found or cannot be cancelled",
      });
      return;
    }

    res.json({
      success: true,
      message: "Print job cancelled",
      data: printJob,
    });
  } catch (error: any) {
    console.error("Error cancelling print job:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel print job",
    });
  }
};

/**
 * Check printer connectivity
 */
export const checkPrinterConnectivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const printers = await printerService.getPrinters(outletId);

    // Categorize printers by status
    const online = printers.filter((p) => p.status === "online");
    const offline = printers.filter((p) => p.status === "offline");
    const error = printers.filter((p) => p.status === "error");

    const hasOnlinePrinter = online.length > 0;
    const defaultPrinter = printers.find((p) => p.isDefault);

    res.json({
      success: true,
      data: {
        total: printers.length,
        online: online.length,
        offline: offline.length,
        error: error.length,
        hasOnlinePrinter,
        defaultPrinter: defaultPrinter || null,
        printers: {
          online,
          offline,
          error,
        },
      },
    });
  } catch (error: any) {
    console.error("Error checking printer connectivity:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check printer connectivity",
    });
  }
};
