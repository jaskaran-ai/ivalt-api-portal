// AWS API Gateway Usage Service
// Fetches key usage statistics from AWS API Gateway

import {
  APIGatewayClient,
  GetUsageCommand,
  GetUsagePlanKeysCommand,
} from '@aws-sdk/client-api-gateway';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const requestHandler = new NodeHttpHandler({
  requestTimeout: 5000,
  connectionTimeout: 3000,
});

/**
 * Creates a fresh APIGatewayClient per-request, reading credentials from
 * process.env at call time (not at module load time).
 *
 * A module-level singleton is unsafe here because Next.js populates process.env
 * from .env files *after* modules are first imported, so a cached client would
 * be frozen with whatever credentials (or lack thereof) existed at import time.
 *
 * We also explicitly set `sessionToken: undefined` to prevent the SDK from
 * inheriting an ambient AWS_SESSION_TOKEN that may have been injected by the
 * Vercel CLI (VERCEL_OIDC_TOKEN / .env.vercel) or any other tool.
 */
function makeClient(): APIGatewayClient {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env, or enable NEXT_PUBLIC_DEMO_MODE=true',
    );
  }

  return new APIGatewayClient({
    region,
    requestHandler,
    maxAttempts: 1,
    credentials: {
      accessKeyId,
      secretAccessKey,
      // Explicitly omit sessionToken so the SDK never sends a stale/invalid
      // security token that may have been injected by an ambient provider.
      sessionToken: undefined,
    },
  });
}

// Keep a reference so we can export for tests (mirrors aws-gateway.ts pattern).
export function getClient(): APIGatewayClient {
  return makeClient();
}

// DEMO MODE - Returns mock data
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface ApiKeyUsage {
  awsKeyId: string;
  usageCount: number;
}

export async function fetchApiKeyUsage(): Promise<ApiKeyUsage[]> {
  // In demo mode, return mock usage data
  if (DEMO_MODE) {
    return [
      { awsKeyId: 'demo-key-001', usageCount: 15420 },
      { awsKeyId: 'demo-key-002', usageCount: 8750 },
      { awsKeyId: 'demo-key-003', usageCount: 0 },
    ];
  }

  const apiKeyClient = getClient();
  const usagePlanId = process.env.AWS_API_GATEWAY_USAGE_PLAN_ID;
  if (!usagePlanId) {
    console.error('AWS_API_GATEWAY_USAGE_PLAN_ID env var is not set');
    return [];
  }
  const usageData: ApiKeyUsage[] = [];

  try {
    // Get all keys in the usage plan
    const keysParams = {
      usagePlanId,
      limit: 100,
    };

    const keysCommand = new GetUsagePlanKeysCommand(keysParams);
    const keysResponse = (await apiKeyClient.send(keysCommand)) as {
      keys?: { id: string; value: string }[];
    };

    if (!keysResponse.keys || keysResponse.keys.length === 0) {
      return [];
    }

    // For each key, get its usage
    for (const key of keysResponse.keys) {
      if (!key.id || !key.value) continue;

      // Get usage for this specific key
      const usageParams = {
        usagePlanId,
        apiKey: key.value,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        endDate: new Date().toISOString(),
      };

      const usageCommand = new GetUsageCommand(usageParams);
      const usageResponse = (await apiKeyClient.send(usageCommand)) as {
        usage?: { count?: number }[];
      };

      // Sum up the usage count from all periods
      let totalCount = 0;
      if (usageResponse.usage) {
        for (const period of usageResponse.usage) {
          if (period.count) {
            totalCount += period.count;
          }
        }
      }

      usageData.push({
        awsKeyId: key.id,
        usageCount: totalCount,
      });
    }
  } catch (error) {
    console.error('Error fetching API key usage:', error);
    // Return empty array on error - usage tracking is not critical
    return [];
  }

  return usageData;
}
