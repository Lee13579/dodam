import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/constants";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const styleId = searchParams.get("styleId");

    // In a real app, this would query a database based on styleId
    // For now, we return all mock products as a baseline
    return NextResponse.json(MOCK_PRODUCTS);
}
