// =============================================================================
// DEMO MODE
// Set NEXT_PUBLIC_DEMO_MODE=true in .env.local to bypass all real API calls.
// In demo mode: no DB, no AWS, no iVALT credentials needed.
// =============================================================================

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export type DemoUser = {
  id: string;
  phoneNumber: string;
  name: string;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-user-approved",
    phoneNumber: "+919876543210",
    name: "Jaskaran (Approved)",
    status: "approved",
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-04-01T09:00:00Z"),
    lastLoginAt: new Date("2025-05-07T08:30:00Z"),
  },
  {
    id: "demo-user-pending",
    phoneNumber: "+919876543211",
    name: "Rahul (Pending)",
    status: "pending",
    createdAt: new Date("2025-02-10T14:00:00Z"),
    updatedAt: new Date("2025-03-15T11:00:00Z"),
    lastLoginAt: new Date("2025-03-15T11:00:00Z"),
  },
  {
    id: "demo-user-rejected",
    phoneNumber: "+919876543212",
    name: "Vikesh (Rejected)",
    status: "rejected",
    createdAt: new Date("2025-01-20T08:00:00Z"),
    updatedAt: new Date("2025-02-01T10:00:00Z"),
    lastLoginAt: new Date("2025-02-01T10:00:00Z"),
  },
  {
    id: "demo-user-004",
    phoneNumber: "+919876543213",
    name: "Priya Sharma",
    status: "approved",
    createdAt: new Date("2025-03-01T09:00:00Z"),
    updatedAt: new Date("2025-05-10T11:00:00Z"),
    lastLoginAt: new Date("2025-06-01T10:00:00Z"),
  },
  {
    id: "demo-user-005",
    phoneNumber: "+919876543214",
    name: "Arjun Mehta",
    status: "approved",
    createdAt: new Date("2025-03-05T11:30:00Z"),
    updatedAt: new Date("2025-05-12T14:00:00Z"),
    lastLoginAt: new Date("2025-05-30T09:15:00Z"),
  },
  {
    id: "demo-user-006",
    phoneNumber: "+919876543215",
    name: "Sneha Patel",
    status: "pending",
    createdAt: new Date("2025-04-12T08:00:00Z"),
    updatedAt: new Date("2025-04-12T08:00:00Z"),
    lastLoginAt: new Date("2025-04-12T08:00:00Z"),
  },
  {
    id: "demo-user-007",
    phoneNumber: "+919876543216",
    name: "Vikram Singh",
    status: "approved",
    createdAt: new Date("2025-03-20T16:45:00Z"),
    updatedAt: new Date("2025-05-15T10:30:00Z"),
    lastLoginAt: new Date("2025-05-28T14:20:00Z"),
  },
  {
    id: "demo-user-008",
    phoneNumber: "+919876543217",
    name: "Ananya Gupta",
    status: "rejected",
    createdAt: new Date("2025-02-28T12:00:00Z"),
    updatedAt: new Date("2025-03-02T09:00:00Z"),
    lastLoginAt: new Date("2025-03-02T09:00:00Z"),
  },
  {
    id: "demo-user-009",
    phoneNumber: "+919876543218",
    name: "Rohit Verma",
    status: "approved",
    createdAt: new Date("2025-04-01T07:30:00Z"),
    updatedAt: new Date("2025-05-20T16:00:00Z"),
    lastLoginAt: new Date("2025-06-02T11:45:00Z"),
  },
  {
    id: "demo-user-010",
    phoneNumber: "+919876543219",
    name: "Neha Kapoor",
    status: "pending",
    createdAt: new Date("2025-05-10T13:00:00Z"),
    updatedAt: new Date("2025-05-10T13:00:00Z"),
    lastLoginAt: new Date("2025-05-10T13:00:00Z"),
  },
  {
    id: "demo-user-011",
    phoneNumber: "+919876543220",
    name: "Amit Joshi",
    status: "approved",
    createdAt: new Date("2025-03-15T10:15:00Z"),
    updatedAt: new Date("2025-05-18T09:30:00Z"),
    lastLoginAt: new Date("2025-05-25T08:00:00Z"),
  },
  {
    id: "demo-user-012",
    phoneNumber: "+919876543221",
    name: "Kavita Reddy",
    status: "approved",
    createdAt: new Date("2025-04-22T15:00:00Z"),
    updatedAt: new Date("2025-05-22T12:00:00Z"),
    lastLoginAt: new Date("2025-06-01T07:30:00Z"),
  },
  {
    id: "demo-user-013",
    phoneNumber: "+919876543222",
    name: "Manish Tiwari",
    status: "pending",
    createdAt: new Date("2025-05-25T09:00:00Z"),
    updatedAt: new Date("2025-05-25T09:00:00Z"),
    lastLoginAt: new Date("2025-05-25T09:00:00Z"),
  },
  {
    id: "demo-user-014",
    phoneNumber: "+919876543223",
    name: "Pooja Nair",
    status: "approved",
    createdAt: new Date("2025-04-05T11:30:00Z"),
    updatedAt: new Date("2025-05-28T14:00:00Z"),
    lastLoginAt: new Date("2025-05-28T14:00:00Z"),
  },
  {
    id: "demo-user-015",
    phoneNumber: "+919876543224",
    name: "Deepak Kumar",
    status: "rejected",
    createdAt: new Date("2025-03-10T08:45:00Z"),
    updatedAt: new Date("2025-03-12T10:00:00Z"),
    lastLoginAt: new Date("2025-03-12T10:00:00Z"),
  },
  {
    id: "demo-user-016",
    phoneNumber: "+919876543225",
    name: "Ritu Agarwal",
    status: "approved",
    createdAt: new Date("2025-05-01T10:00:00Z"),
    updatedAt: new Date("2025-05-30T11:00:00Z"),
    lastLoginAt: new Date("2025-06-03T09:00:00Z"),
  },
];

export const DEMO_SESSION = {
  userId: DEMO_USERS[0].id,
  phoneNumber: DEMO_USERS[0].phoneNumber,
  isLoggedIn: true,
  accessStatus: "approved",
};

export function getDemoUser(phoneNumber: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.phoneNumber === phoneNumber);
}

export const DEMO_API_KEYS = [
  {
    id: "demo-key-001",
    userId: DEMO_USERS[0].id,
    awsKeyId: "abc1234567890xyz",
    keyName: "Production App",
    keyValue: "ivalt••••••••••••••••••••3f9a",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-03-01T12:00:00Z"),
    lastUsedAt: new Date("2025-05-06T16:45:00Z"),
  },
  {
    id: "demo-key-002",
    userId: DEMO_USERS[0].id,
    awsKeyId: "def9876543210uvw",
    keyName: "Mobile SDK",
    keyValue: "ivalt••••••••••••••••••••8b2c",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-03-20T09:15:00Z"),
    lastUsedAt: new Date("2025-05-07T07:10:00Z"),
  },
  {
    id: "demo-key-003",
    userId: DEMO_USERS[0].id,
    awsKeyId: "ghi5432109876rst",
    keyName: "Staging Environment",
    keyValue: "ivalt••••••••••••••••••••1d4e",
    isActive: false,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-10T14:30:00Z"),
    lastUsedAt: null,
  },
  {
    id: "demo-key-004",
    userId: DEMO_USERS[3].id,
    awsKeyId: "jkl4567890123mno",
    keyName: "Priya App iOS",
    keyValue: "ivalt••••••••••••••••••••4g5h",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-15T11:00:00Z"),
    lastUsedAt: new Date("2025-05-28T15:30:00Z"),
  },
  {
    id: "demo-key-005",
    userId: DEMO_USERS[3].id,
    awsKeyId: "pqr7890123456stu",
    keyName: "Priya Backend Service",
    keyValue: "ivalt••••••••••••••••••••6i7j",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-20T14:00:00Z"),
    lastUsedAt: new Date("2025-05-25T09:00:00Z"),
  },
  {
    id: "demo-key-006",
    userId: DEMO_USERS[4].id,
    awsKeyId: "vwx0123456789yza",
    keyName: "Arjun Web Portal",
    keyValue: "ivalt••••••••••••••••••••8k9l",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-25T10:30:00Z"),
    lastUsedAt: new Date("2025-05-29T12:00:00Z"),
  },
  {
    id: "demo-key-007",
    userId: DEMO_USERS[4].id,
    awsKeyId: "bcd3456789012efg",
    keyName: "Arjun Analytics",
    keyValue: "ivalt••••••••••••••••••••0m1n",
    isActive: false,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-05-01T08:00:00Z"),
    lastUsedAt: new Date("2025-05-10T16:00:00Z"),
  },
  {
    id: "demo-key-008",
    userId: DEMO_USERS[6].id,
    awsKeyId: "hij6789012345klm",
    keyName: "Vikram SaaS Platform",
    keyValue: "ivalt••••••••••••••••••••2o3p",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-05T13:45:00Z"),
    lastUsedAt: new Date("2025-06-01T10:15:00Z"),
  },
  {
    id: "demo-key-009",
    userId: DEMO_USERS[8].id,
    awsKeyId: "nop9012345678qrs",
    keyName: "Rohit Fintech App",
    keyValue: "ivalt••••••••••••••••••••4q5r",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-18T09:00:00Z"),
    lastUsedAt: new Date("2025-05-30T08:30:00Z"),
  },
  {
    id: "demo-key-010",
    userId: DEMO_USERS[10].id,
    awsKeyId: "tuv6789012345wxy",
    keyName: "Amit Health API",
    keyValue: "ivalt••••••••••••••••••••6s7t",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-28T11:15:00Z"),
    lastUsedAt: new Date("2025-05-27T14:30:00Z"),
  },
  {
    id: "demo-key-011",
    userId: DEMO_USERS[11].id,
    awsKeyId: "zab7890123456cde",
    keyName: "Kavita E-Commerce",
    keyValue: "ivalt••••••••••••••••••••8u9v",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-05-05T15:30:00Z"),
    lastUsedAt: new Date("2025-06-02T11:00:00Z"),
  },
  {
    id: "demo-key-012",
    userId: DEMO_USERS[13].id,
    awsKeyId: "fgh1234567890ijk",
    keyName: "Pooja Education SDK",
    keyValue: "ivalt••••••••••••••••••••0w1x",
    isActive: false,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-05-10T10:00:00Z"),
    lastUsedAt: null,
  },
  {
    id: "demo-key-013",
    userId: DEMO_USERS[15].id,
    awsKeyId: "lmn4567890123opq",
    keyName: "Ritu CRM Integration",
    keyValue: "ivalt••••••••••••••••••••2y3z",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-05-15T08:45:00Z"),
    lastUsedAt: new Date("2025-06-03T09:00:00Z"),
  },
];

// ── Key usage counts for demo ─────────────────────────────────────────────────

export const DEMO_KEY_USAGE: Record<string, number> = {
  "demo-key-001": 15420,
  "demo-key-002": 8750,
  "demo-key-003": 320,
  "demo-key-004": 6120,
  "demo-key-005": 2890,
  "demo-key-006": 9450,
  "demo-key-007": 450,
  "demo-key-008": 11200,
  "demo-key-009": 7830,
  "demo-key-010": 5340,
  "demo-key-011": 4210,
  "demo-key-012": 0,
  "demo-key-013": 1560,
};

// ── Admin mock data ───────────────────────────────────────────────────────────

export const DEMO_ACCESS_REQUESTS = [
  {
    id: "demo-req-001",
    userId: DEMO_USERS[1].id,
    useCase:
      "Building a mobile authentication SDK for Android and iOS that integrates iVALT biometric verification for enterprise customers.",
    requestedAt: new Date("2025-04-15T10:30:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[1].id,
      phoneNumber: DEMO_USERS[1].phoneNumber,
      name: DEMO_USERS[1].name,
    },
  },
  {
    id: "demo-req-002",
    userId: DEMO_USERS[2].id,
    useCase:
      "Implementing biometric login for a healthcare platform requiring HIPAA compliance and multi-factor authentication.",
    requestedAt: new Date("2025-03-20T14:00:00Z"),
    approvedAt: new Date("2025-03-22T09:00:00Z"),
    adminNotes: "Approved after identity verification",
    user: {
      id: DEMO_USERS[2].id,
      phoneNumber: DEMO_USERS[2].phoneNumber,
      name: DEMO_USERS[2].name,
    },
  },
  {
    id: "demo-req-003",
    userId: DEMO_USERS[5].id,
    useCase: "Developing a secure document signing platform with biometric verification for legal compliance.",
    requestedAt: new Date("2025-04-28T16:00:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[5].id,
      phoneNumber: DEMO_USERS[5].phoneNumber,
      name: DEMO_USERS[5].name,
    },
  },
  {
    id: "demo-req-004",
    userId: DEMO_USERS[7].id,
    useCase: "Building a biometric attendance system for corporate offices with real-time tracking.",
    requestedAt: new Date("2025-03-05T11:00:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[7].id,
      phoneNumber: DEMO_USERS[7].phoneNumber,
      name: DEMO_USERS[7].name,
    },
  },
  {
    id: "demo-req-005",
    userId: DEMO_USERS[9].id,
    useCase: "Integrating biometric authentication into a banking app for secure transaction approvals.",
    requestedAt: new Date("2025-05-18T14:30:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[9].id,
      phoneNumber: DEMO_USERS[9].phoneNumber,
      name: DEMO_USERS[9].name,
    },
  },
  {
    id: "demo-req-006",
    userId: DEMO_USERS[12].id,
    useCase: "Implementing passwordless login for a SaaS CRM platform serving 50,000+ users.",
    requestedAt: new Date("2025-06-01T09:15:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[12].id,
      phoneNumber: DEMO_USERS[12].phoneNumber,
      name: DEMO_USERS[12].name,
    },
  },
  {
    id: "demo-req-007",
    userId: DEMO_USERS[4].id,
    useCase: "Creating a biometric verification layer for a government e-governance portal.",
    requestedAt: new Date("2025-05-05T10:00:00Z"),
    approvedAt: new Date("2025-05-07T14:00:00Z"),
    adminNotes: "Approved — government project",
    user: {
      id: DEMO_USERS[4].id,
      phoneNumber: DEMO_USERS[4].phoneNumber,
      name: DEMO_USERS[4].name,
    },
  },
  {
    id: "demo-req-008",
    userId: DEMO_USERS[6].id,
    useCase: "Building a secure API gateway for microservices with biometric MFU7 authentication.",
    requestedAt: new Date("2025-04-10T08:30:00Z"),
    approvedAt: new Date("2025-04-12T11:00:00Z"),
    adminNotes: "Approved",
    user: {
      id: DEMO_USERS[6].id,
      phoneNumber: DEMO_USERS[6].phoneNumber,
      name: DEMO_USERS[6].name,
    },
  },
  {
    id: "demo-req-009",
    userId: DEMO_USERS[8].id,
    useCase: "Fintech platform requiring biometric MFA for high-value transactions above ₹10,000.",
    requestedAt: new Date("2025-04-20T13:00:00Z"),
    approvedAt: new Date("2025-04-22T09:30:00Z"),
    adminNotes: "Approved — financial services use case",
    user: {
      id: DEMO_USERS[8].id,
      phoneNumber: DEMO_USERS[8].phoneNumber,
      name: DEMO_USERS[8].name,
    },
  },
  {
    id: "demo-req-010",
    userId: DEMO_USERS[10].id,
    useCase: "Healthcare platform requiring biometric patient identity verification for telemedicine.",
    requestedAt: new Date("2025-05-02T15:45:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[10].id,
      phoneNumber: DEMO_USERS[10].phoneNumber,
      name: DEMO_USERS[10].name,
    },
  },
  {
    id: "demo-req-011",
    userId: DEMO_USERS[11].id,
    useCase: "E-commerce platform with biometric payment confirmation for fraud prevention.",
    requestedAt: new Date("2025-05-22T10:30:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[11].id,
      phoneNumber: DEMO_USERS[11].phoneNumber,
      name: DEMO_USERS[11].name,
    },
  },
  {
    id: "demo-req-012",
    userId: DEMO_USERS[13].id,
    useCase: "EdTech platform with biometric attendance and exam proctoring features.",
    requestedAt: new Date("2025-05-28T12:00:00Z"),
    approvedAt: null,
    adminNotes: null,
    user: {
      id: DEMO_USERS[13].id,
      phoneNumber: DEMO_USERS[13].phoneNumber,
      name: DEMO_USERS[13].name,
    },
  },
];

export function getDemoAdminUsers() {
  return DEMO_USERS.map((u) => ({
    id: u.id,
    phoneNumber: u.phoneNumber,
    name: u.name,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    approvedAt: u.status === "approved" ? u.updatedAt.toISOString() : null,
    apiKeyCount: DEMO_API_KEYS.filter((k) => k.userId === u.id).length,
  }));
}

export function getDemoAdminKeys() {
  return DEMO_API_KEYS.map((k) => {
    const user = DEMO_USERS.find((u) => u.id === k.userId);
    return {
      id: k.id,
      keyName: k.keyName,
      awsKeyId: k.awsKeyId,
      keyValue: null,
      isActive: k.isActive,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      usageCount: DEMO_KEY_USAGE[k.id] ?? 0,
      user: user
        ? {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            status: user.status,
          }
        : null,
    };
  });
}

export function getDemoAdminUsage() {
  const keys = getDemoAdminKeys();
  return {
    usage: keys,
    summary: {
      totalUsers: DEMO_USERS.length,
      usersThisWeek: 2,
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.isActive).length,
      inactiveKeys: keys.filter((k) => !k.isActive).length,
      recentlyUsed: keys.filter((k) => k.lastUsedAt).length,
      totalRequests: keys.reduce((sum, k) => sum + k.usageCount, 0),
    },
  };
}

export function getDemoAccessRequests() {
  return DEMO_ACCESS_REQUESTS.map((r) => ({
    ...r,
    requestedAt: r.requestedAt.toISOString(),
    approvedAt: r.approvedAt?.toISOString() ?? null,
  }));
}

let _demoKeys = [...DEMO_API_KEYS];

export function getDemoKeys() {
  return _demoKeys;
}

export function addDemoKey(key: (typeof DEMO_API_KEYS)[0]) {
  _demoKeys = [key, ..._demoKeys];
}

export function deleteDemoKey(id: string) {
  _demoKeys = _demoKeys.filter((k) => k.id !== id);
}

export function toggleDemoKey(id: string, isActive: boolean) {
  _demoKeys = _demoKeys.map((k) => (k.id === id ? { ...k, isActive } : k));
}
