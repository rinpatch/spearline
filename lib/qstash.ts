import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";

const qstashReceiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

/**
 * Verifies the signature of an incoming NextRequest from QStash.
 * Skips verification in development environment.
 * @param req - The NextRequest object.
 * @param body - The raw request body as a string.
 * @returns A NextResponse object if verification fails, otherwise null.
 */
export async function verifyQstashSignature(req: NextRequest, body: string): Promise<NextResponse | null> {
    if (process.env.NODE_ENV === "development") {
        return null;
    }

    const signature = req.headers.get("upstash-signature");
    if (!signature) {
        console.error("QStash signature missing from request.");
        return new NextResponse("Missing signature", { status: 401 });
    }

    try {
        const isValid = await qstashReceiver.verify({ signature, body });
        if (!isValid) {
            console.warn("Invalid QStash signature received.");
            return new NextResponse("Invalid signature", { status: 401 });
        }
        return null; // Signature is valid
    } catch (error) {
        console.error("QStash signature verification failed:", error);
        return new NextResponse("Signature verification failed", { status: 500 });
    }
} 