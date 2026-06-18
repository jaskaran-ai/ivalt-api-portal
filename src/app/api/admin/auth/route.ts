import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo";
import { sendBiometricAuthRequest } from "@/lib/ivalt";

const ADMIN_PHONE = "+919530654704";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleanPhone = phoneNumber.replace(/\s/g, "");

    if (cleanPhone !== ADMIN_PHONE) {
      return NextResponse.json({ error: "Unauthorized admin phone number" }, { status: 403 });
    }

    if (DEMO_MODE) {
      return NextResponse.json({ success: true, message: "Admin auth request sent (demo)" });
    }

    const result = await sendBiometricAuthRequest(cleanPhone);

    if (!result.success) {
      if (result.statusCode === 404) {
        return NextResponse.json(
          { error: "Admin phone not registered with iVALT app" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: result.message || "Admin auth request failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Authentication request sent to admin iVALT app" });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
