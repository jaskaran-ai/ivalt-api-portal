import { describe, test, expect, mock, beforeEach } from "bun:test";

let mockSend = mock<(command: unknown) => unknown>();

mock.module("@aws-sdk/client-api-gateway", () => {
  class MockCommand {
    constructor(public input: unknown) {}
  }

  return {
    APIGatewayClient: class {
      send = mockSend;
    },
    CreateApiKeyCommand: MockCommand,
    DeleteApiKeyCommand: MockCommand,
    GetApiKeyCommand: MockCommand,
    UpdateApiKeyCommand: MockCommand,
    CreateUsagePlanKeyCommand: MockCommand,
    DeleteUsagePlanKeyCommand: MockCommand,
  };
});

// Set required env vars before importing
process.env.AWS_REGION = "us-east-1";
process.env.AWS_ACCESS_KEY_ID = "test-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
process.env.AWS_API_GATEWAY_USAGE_PLAN_ID = "test-plan";

const { createAwsApiKey, deleteAwsApiKey, toggleAwsApiKey, getAwsApiKey, __resetClientForTest } =
  await import("@/lib/aws-gateway");

beforeEach(() => {
  mockSend = mock<(command: unknown) => unknown>();
  __resetClientForTest();
});

describe("createAwsApiKey", () => {
  test("creates key and attaches to usage plan", async () => {
    mockSend
      .mockReturnValueOnce({
        id: "key-123",
        name: "test-key",
        value: "my-api-key-value",
        enabled: true,
        createdDate: new Date("2025-01-01"),
      })
      .mockReturnValueOnce({});

    const result = await createAwsApiKey("test-key", "test description");

    expect(result.id).toBe("key-123");
    expect(result.value).toBe("my-api-key-value");
    expect(result.name).toBe("test-key");
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  test("throws when AWS returns no id", async () => {
    mockSend.mockReturnValueOnce({ id: undefined, value: undefined });

    expect(createAwsApiKey("bad-key")).rejects.toThrow("AWS API Gateway");
  });

  test("uses default description when none provided", async () => {
    mockSend.mockReturnValueOnce({
      id: "key-456",
      name: "test-key",
      value: "val",
      enabled: true,
    });

    const result = await createAwsApiKey("test-key");
    expect(result.id).toBe("key-456");
  });
});

describe("deleteAwsApiKey", () => {
  test("deletes from usage plan then deletes key", async () => {
    mockSend.mockReturnValue({});

    await deleteAwsApiKey("key-123");

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  test("handles missing usage plan key gracefully", async () => {
    mockSend
      .mockReturnValueOnce(Promise.reject(new Error("Not found")))
      .mockReturnValueOnce(Promise.resolve({}));

    await deleteAwsApiKey("key-123");

    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});

describe("toggleAwsApiKey", () => {
  test("sends patch to enable key", async () => {
    mockSend.mockReturnValue({});

    await toggleAwsApiKey("key-123", true);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

describe("getAwsApiKey", () => {
  test("returns key data without value", async () => {
    mockSend.mockReturnValue({ id: "key-123", enabled: true });

    const result = await getAwsApiKey("key-123");

    expect(result.id).toBe("key-123");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
