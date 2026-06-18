import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { fetchApiKeyUsage } from "@/lib/api-gateway-usage";
import { gte } from "drizzle-orm";
import { DEMO_MODE, getDemoAdminUsage } from "@/lib/demo";

export async function GET(_req: NextRequest) {
  try {
    if (DEMO_MODE) {
      return NextResponse.json(getDemoAdminUsage());
    }

    let usageData: Array<{ awsKeyId: string; usageCount: number }> = [];
    try {
      usageData = await fetchApiKeyUsage();
    } catch (err) {
      console.error("AWS usage fetch failed (non-fatal):", err);
    }

    const allKeys = await db.query.apiKeys.findMany({
      with: { user: true },
    });

    const keysWithUsage = allKeys.map((key) => {
      const usage = usageData.find((u) => u.awsKeyId === key.awsKeyId);
      return {
        id: key.id,
        keyName: key.keyName,
        awsKeyId: key.awsKeyId,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        usageCount: usage?.usageCount || 0,
        user: key.user
          ? {
              id: key.user.id,
              name: key.user.name,
              phoneNumber: key.user.phoneNumber,
              role: key.user.role,
            }
          : null,
      };
    });

    const totalKeys = keysWithUsage.length;
    const activeKeys = keysWithUsage.filter((k) => k.isActive).length;
    const totalRequests = keysWithUsage.reduce((sum, k) => sum + k.usageCount, 0);
    const recentlyUsed = keysWithUsage.filter(
      (k) => k.lastUsedAt && new Date(k.lastUsedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    const inactive = keysWithUsage.filter(
      (k) => !k.lastUsedAt || new Date(k.lastUsedAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const totalUsers = await db.$count(users);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const usersThisWeek = await db.$count(users, gte(users.createdAt, oneWeekAgo));

    return NextResponse.json({
      usage: keysWithUsage,
      summary: {
        totalUsers,
        usersThisWeek,
        totalKeys,
        activeKeys,
        inactiveKeys: inactive,
        recentlyUsed,
        totalRequests,
      },
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json({
      usage: [],
      summary: {
        totalUsers: 0,
        usersThisWeek: 0,
        totalKeys: 0,
        activeKeys: 0,
        inactiveKeys: 0,
        recentlyUsed: 0,
        totalRequests: 0,
      },
      error: "Internal server error",
    }, { status: 500 });
  }
}
