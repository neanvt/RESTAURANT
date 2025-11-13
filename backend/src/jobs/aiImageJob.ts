import Bull, { Job, Queue } from "bull";
import aiImageService from "../services/aiImageService";
import Item from "../models/Item";
import logger from "../utils/logger";

export interface AIImageJobData {
  itemId: string;
  prompt: string;
  categoryName?: string;
  description?: string;
}

// Create AI Image Generation Queue
const aiImageQueue: Queue<AIImageJobData> = new Bull("ai-image-generation", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Process AI Image Generation Jobs
aiImageQueue.process(async (job: Job<AIImageJobData>) => {
  const { itemId, prompt, categoryName, description } = job.data;

  logger.info(`Processing AI image generation for item ${itemId}`);

  try {
    // Generate image
    const generatedImage = await aiImageService.generateItemImage(
      prompt,
      categoryName,
      description
    );

    // Update item with generated image
    const item = await Item.findById(itemId);
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    item.image = {
      url: generatedImage.localPath,
      isAiGenerated: true,
      aiPrompt: generatedImage.prompt,
    };

    await item.save();

    logger.info(`AI image generated successfully for item ${itemId}`);

    return {
      success: true,
      itemId,
      imagePath: generatedImage.localPath,
    };
  } catch (error: any) {
    logger.error(`Error generating AI image for item ${itemId}:`, error);
    throw error;
  }
});

// Event listeners
aiImageQueue.on("completed", (job, result) => {
  logger.info(`Job ${job.id} completed successfully:`, result);
});

aiImageQueue.on("failed", (job, error) => {
  logger.error(`Job ${job?.id} failed:`, error);
});

aiImageQueue.on("stalled", (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

// Helper function to add image generation job
export const queueAIImageGeneration = async (
  data: AIImageJobData
): Promise<Job<AIImageJobData>> => {
  return aiImageQueue.add(data, {
    priority: 1,
  });
};

// Get queue status
export const getQueueStatus = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    aiImageQueue.getWaitingCount(),
    aiImageQueue.getActiveCount(),
    aiImageQueue.getCompletedCount(),
    aiImageQueue.getFailedCount(),
    aiImageQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
};

// Clean old jobs
export const cleanQueue = async () => {
  await aiImageQueue.clean(24 * 60 * 60 * 1000); // Clean jobs older than 24 hours
  logger.info("AI image queue cleaned");
};

export default aiImageQueue;
