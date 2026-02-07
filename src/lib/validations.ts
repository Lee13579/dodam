import { z } from "zod";

export const RecommendationSchema = z.object({
    image: z.string().min(1, "Image is required"),
});

export const GenerationSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    image: z.string().min(1, "Base image is required"),
    clothImage: z.string().optional(),
    accImage: z.string().optional(),
});

export const StylingNoteSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    mode: z.enum(["pictorial", "vto", "custom"]).optional(),
    dogName: z.string().optional(),
});
