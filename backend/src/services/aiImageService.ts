// AI image service removed per request. Kept as a small stub to avoid breaking imports.

class AIImageServiceStub {
  isConfigured(): boolean {
    return false;
  }

  /**
   * Stub for generateItemImage to satisfy TypeScript signatures.
   * Not usable at runtime because AI generation is disabled.
   */
  async generateItemImage(
    prompt: string,
    categoryName?: string,
    description?: string
  ): Promise<{ url: string; localPath: string; prompt: string }> {
    // Mark parameters as used to satisfy compiler/linter
    void prompt;
    void categoryName;
    void description;

    // Return a rejected promise indicating the feature is disabled.
    return Promise.reject(
      new Error("AI image generation is disabled in this build")
    );
  }

  /**
   * Stub for deleteImage to satisfy callers that attempt to delete old AI images.
   */
  async deleteImage(localPath: string): Promise<boolean> {
    // Mark parameter as used to satisfy compiler/linter
    void localPath;

    // No-op: return false indicating no file deleted
    return false;
  }
}

export default new AIImageServiceStub();
