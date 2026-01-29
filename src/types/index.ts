export type DogStyle = "Teddy Bear" | "Formal Tuxedo" | "Streetwear" | "Hawaiian" | "Cozy Winter" | "Rainy Day";

export interface StyleOption {
    id: DogStyle;
    name: string;
    description: string;
    image: string;
}

export interface StylingResult {
    id: string;
    originalImage: string;
    styledImage: string;
    analysis: string;
    style: DogStyle;
    timestamp: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    url: string;
    category: "Grooming" | "Accessory" | "Shampoo";
}
