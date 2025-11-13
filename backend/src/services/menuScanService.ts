import OpenAI from "openai";
import Item from "../models/Item";
import Category from "../models/Category";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScannedMenuItem {
  name: string;
  price: number;
  category?: string;
  description?: string;
  confidence: number;
}

interface ScanResult {
  items: ScannedMenuItem[];
  suggestedCategories: string[];
  totalItems: number;
  processingTime: number;
}

export class MenuScanService {
  /**
   * Scan menu image using OpenAI Vision API
   */
  async scanMenuImage(
    imageUrl: string,
    _outletId: string
  ): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      const prompt = `Analyze this restaurant menu image and extract ALL menu items with their prices. 
      
For each item, provide:
1. Item name (clean, properly capitalized)
2. Price (numeric value only, without currency symbols)
3. Category (if visible, e.g., Starters, Main Course, Desserts, Beverages)
4. Description (if available)

Return the data in this exact JSON format:
{
  "items": [
    {
      "name": "Item Name",
      "price": 150,
      "category": "Category Name",
      "description": "Brief description",
      "confidence": 0.95
    }
  ],
  "suggestedCategories": ["Category1", "Category2"]
}

Rules:
- Extract ALL visible items
- Prices should be numbers only (e.g., 150, not ₹150)
- If price is a range, use the lower value
- Group similar items under same category
- Confidence: 1.0 = very clear, 0.5 = unclear
- Include half/full portions as separate items if shown
- Skip headers, footers, and non-menu text`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.2, // Low temperature for more consistent extraction
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Parse JSON response
      let result: ScanResult;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : content;
        const parsed = JSON.parse(jsonText);

        result = {
          items: parsed.items || [],
          suggestedCategories: parsed.suggestedCategories || [],
          totalItems: parsed.items?.length || 0,
          processingTime: Date.now() - startTime,
        };
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        throw new Error("Failed to parse menu data from image");
      }

      // Validate and clean items
      result.items = result.items.filter((item) => {
        return (
          item.name &&
          item.name.length > 0 &&
          item.price !== undefined &&
          item.price > 0
        );
      });

      return result;
    } catch (error: any) {
      console.error("Error scanning menu:", error);
      throw new Error(`Menu scan failed: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Validate scanned items against existing items
   */
  async validateScannedItems(
    items: ScannedMenuItem[],
    outletId: string
  ): Promise<{
    newItems: ScannedMenuItem[];
    duplicates: Array<{ scanned: ScannedMenuItem; existing: any }>;
    totalNew: number;
    totalDuplicates: number;
  }> {
    const existingItems = await Item.find({ outlet: outletId }).select(
      "name price"
    );

    const newItems: ScannedMenuItem[] = [];
    const duplicates: Array<{ scanned: ScannedMenuItem; existing: any }> = [];

    for (const scannedItem of items) {
      // Check for duplicates (case-insensitive name match)
      const duplicate = existingItems.find(
        (existing) =>
          existing.name.toLowerCase() === scannedItem.name.toLowerCase()
      );

      if (duplicate) {
        duplicates.push({
          scanned: scannedItem,
          existing: duplicate,
        });
      } else {
        newItems.push(scannedItem);
      }
    }

    return {
      newItems,
      duplicates,
      totalNew: newItems.length,
      totalDuplicates: duplicates.length,
    };
  }

  /**
   * Bulk import scanned items
   */
  async bulkImportItems(
    items: ScannedMenuItem[],
    outletId: string,
    userId: string,
    options: {
      createCategories?: boolean;
      skipDuplicates?: boolean;
    } = {}
  ): Promise<{
    imported: any[];
    failed: Array<{ item: ScannedMenuItem; error: string }>;
    categoriesCreated: string[];
  }> {
    const imported: any[] = [];
    const failed: Array<{ item: ScannedMenuItem; error: string }> = [];
    const categoriesCreated: string[] = [];

    // Get or create categories
    const categoryMap = new Map<string, string>();

    if (options.createCategories) {
      const uniqueCategories = [
        ...new Set(items.map((item) => item.category).filter(Boolean)),
      ];

      for (const catName of uniqueCategories) {
        if (!catName) continue;

        let category = await Category.findOne({
          outlet: outletId,
          name: catName,
        });

        if (!category) {
          category = await Category.create({
            outlet: outletId,
            name: catName,
            isActive: true,
            createdBy: userId,
          });
          categoriesCreated.push(catName);
        }

        categoryMap.set(catName, (category._id as any).toString());
      }
    }

    // Import items
    for (const scannedItem of items) {
      try {
        // Check for duplicates if skipDuplicates is enabled
        if (options.skipDuplicates) {
          const existing = await Item.findOne({
            outlet: outletId,
            name: { $regex: new RegExp(`^${scannedItem.name}$`, "i") },
          });

          if (existing) {
            failed.push({
              item: scannedItem,
              error: "Duplicate item already exists",
            });
            continue;
          }
        }

        const categoryId = scannedItem.category
          ? categoryMap.get(scannedItem.category)
          : undefined;

        const item = await Item.create({
          outlet: outletId,
          name: scannedItem.name,
          price: scannedItem.price,
          category: categoryId,
          description: scannedItem.description || "",
          isAvailable: true,
          createdBy: userId,
        });

        imported.push(item);
      } catch (error: any) {
        failed.push({
          item: scannedItem,
          error: error.message || "Failed to import item",
        });
      }
    }

    return {
      imported,
      failed,
      categoriesCreated,
    };
  }

  /**
   * Suggest category for an item based on name
   */
  async suggestCategory(
    itemName: string,
    _outletId: string
  ): Promise<string | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a restaurant menu categorizer. Suggest a single category name for the given menu item. Common categories: Starters, Main Course, Breads, Rice & Biryani, Desserts, Beverages, Soups, Salads, Chinese, Italian, Indian. Return only the category name.",
          },
          {
            role: "user",
            content: `What category would this menu item belong to: "${itemName}"`,
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      return response.choices[0].message.content?.trim() || null;
    } catch (error) {
      console.error("Error suggesting category:", error);
      return null;
    }
  }

  /**
   * Extract price from text using AI
   */
  async extractPriceFromText(text: string): Promise<number | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Extract the numeric price value from the text. Return only the number without currency symbols. If multiple prices, return the first one. If no price found, return 0.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 10,
        temperature: 0.1,
      });

      const priceText = response.choices[0].message.content?.trim();
      const price = parseFloat(priceText || "0");

      return isNaN(price) ? null : price;
    } catch (error) {
      console.error("Error extracting price:", error);
      return null;
    }
  }
}

export default new MenuScanService();
