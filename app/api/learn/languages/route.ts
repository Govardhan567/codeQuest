import { NextResponse } from "next/server";
import { getLanguages } from "@/lib/learn-repository";

export async function GET() {
  try {
    return NextResponse.json(await getLanguages());
  } catch {
    return NextResponse.json(
      { error: "The learning catalogue is unavailable. Apply the Learn migration before using this endpoint." },
      { status: 503 },
    );
  }
}
