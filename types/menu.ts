export type MenuItem = {
  id: string;
  originalName: string;
  translatedName: string;
  category: string;
  price: {
    amount: number;
    currency: string;
  };
  shortDescription: string;
  fullExplanation: string;
  spicinessLevel: number; // 1–5
  likelyIngredients: string[];
  potentialAllergens: string[];
  dietaryFlags: string[];
  suitability?: {
    score: number;
    reason: string;
  };
  hasImageInMenu: boolean;
  boundingBox: [number, number, number, number];
  imageUrls?: string[];
  imageSearchQuery: string;
};

export type MenuResponse = {
  id?: string;
  status?: string;
  targetLanguage?: string;
  restaurantName?: string;
  detectedLanguage?: string;
  items: MenuItem[];
};

export type RecommendItem = {
  id: string;
  reason: string;
};