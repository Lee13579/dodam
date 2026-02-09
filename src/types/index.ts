export type DogStyle = string; // Supports: "ai_1", "ai_2", "ai_3", "ai_4", "ai_5", "custom"

export interface StyleOption {
    id: DogStyle;
    name: string;
    description: string;
    image: string;
}

export interface StylingResult {
    id: string;
    originalImage: string;
    styledImages: string[];
    analysis: string;
    style: DogStyle;
    timestamp: number;
    dogName?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    url: string;
    category: "Grooming" | "Accessory" | "Shampoo" | "Clothing" | "Curation";
    mallName?: string;
}

export interface AiConcept {
    id: string;
    name: string;
    description: string;
    koreanAnalysis: string;
    shoppingTip: string;
    customPrompt: string;
    searchKeywords: string[];
    vtoOutfitEnglish?: string;
}

export interface SuggestedItem {
    id: string;
    name: string;
    searchKeyword: string;
    description: string;
    visualPrompt?: string;
    image?: string;
    realProduct?: Product;
    isUserUploaded?: boolean;
}
