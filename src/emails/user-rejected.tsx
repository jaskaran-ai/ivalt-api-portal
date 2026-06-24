import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img,
  Font,
  Tailwind,
  Link,
  Hr,
} from "@react-email/components";

interface UserRejectedProps {
  userName: string;
}

export function UserRejected({ userName }: UserRejectedProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
        />
        <style>{`
          @media only screen and (max-width: 600px) {
            .email-body { padding: 16px 12px !important; }
            .email-container { max-width: 100% !important; }
            .email-header { padding: 28px 20px !important; }
            .email-card-body { padding: 24px 20px !important; }
            .email-heading { font-size: 18px !important; }
            .email-text { font-size: 13px !important; }
            .email-footer-text { font-size: 11px !important; }
            .email-cta { padding: 11px 24px !important; font-size: 13px !important; }
          }
        `}</style>
      </Head>
      <Tailwind>
        <Body className="m-0 bg-[#f4f2f7]" style={{ padding: "32px 16px" }}>
          <Container className="mx-auto" style={{ maxWidth: "520px", width: "100%" }}>
            <Section className="mb-5">
              <Section
                className="email-header overflow-hidden rounded-xl"
                style={{
                  background: "#ffffff",
                  padding: "32px 28px",
                  textAlign: "center" as const,
                }}
              >
                <Img
                  src="https://ivalt-api-portal.vercel.app/logo-dark.png"
                  alt="iVALT"
                  width="140"
                  height="50"
                  style={{ display: "inline-block" }}
                />
              </Section>
            </Section>

            <Section
              className="overflow-hidden rounded-xl"
              style={{
                background: "#ffffff",
                border: "1px solid #e8e6ee",
              }}
            >
              <div className="email-card-body" style={{ padding: "32px 28px" }}>
                <Section className="mb-5">
                  <table cellPadding="0" cellSpacing="0">
                    <tr>
                      <td
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                          textAlign: "center" as const,
                          verticalAlign: "middle" as const,
                        }}
                      >
                        <Img
                          src="https://api.iconify.design/lucide/clock.svg?color=%23dc2626&width=22&height=22"
                          alt=""
                          width="22"
                          height="22"
                          style={{ display: "block", margin: "13px auto" }}
                        />
                      </td>
                    </tr>
                  </table>
                </Section>

                <Section className="mb-6">
                  <Text
                    className="m-0"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#dc2626",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.08em",
                      marginBottom: "8px",
                    }}
                  >
                    Access Update
                  </Text>
                  <Heading
                    className="email-heading m-0"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.3",
                      marginBottom: "8px",
                    }}
                  >
                    Access request update
                  </Heading>
                  <Text
                    className="email-text m-0"
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.5",
                    }}
                  >
                    Hello {userName}, thank you for your interest in the iVALT API Portal. After
                    reviewing your request, we are unable to approve it at this time.
                  </Text>
                </Section>

                <Section
                  style={{
                    background: "#fef2f2",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    padding: "16px 18px",
                    marginBottom: "24px",
                  }}
                >
                  <Text
                    className="email-text m-0"
                    style={{
                      fontSize: "13px",
                      color: "#991b1b",
                      lineHeight: "1.6",
                      fontWeight: 500,
                    }}
                  >
                    This decision is typically due to incomplete use case details or current
                    platform capacity. We encourage you to review the suggestions below and
                    re-submit your request with additional context.
                  </Text>
                </Section>

                <Section className="mb-6">
                  <Text
                    className="m-0"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.06em",
                      marginBottom: "10px",
                    }}
                  >
                    Recommended Next Steps
                  </Text>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f5",
                          verticalAlign: "top" as const,
                          width: "20px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "#611f69",
                            marginTop: "8px",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "10px 0 10px 8px",
                          borderBottom: "1px solid #f0f0f5",
                        }}
                      >
                        <Text
                          className="email-text m-0"
                          style={{
                            fontSize: "14px",
                            color: "#4b5563",
                            lineHeight: "1.5",
                          }}
                        >
                          Expand your use case description with specific integration details
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f5",
                          verticalAlign: "top" as const,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "#611f69",
                            marginTop: "8px",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "10px 0 10px 8px",
                          borderBottom: "1px solid #f0f0f5",
                        }}
                      >
                        <Text
                          className="email-text m-0"
                          style={{
                            fontSize: "14px",
                            color: "#4b5563",
                            lineHeight: "1.5",
                          }}
                        >
                          Re-submit your request with the additional information
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "10px 0",
                          verticalAlign: "top" as const,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "#611f69",
                            marginTop: "8px",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "10px 0 10px 8px",
                        }}
                      >
                        <Text
                          className="email-text m-0"
                          style={{
                            fontSize: "14px",
                            color: "#4b5563",
                            lineHeight: "1.5",
                          }}
                        >
                          Reach out to our team if you need clarification or guidance
                        </Text>
                      </td>
                    </tr>
                  </table>
                </Section>

                <Hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #eeeef2",
                    margin: "0 0 24px 0",
                  }}
                />

                <Section>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td align="center">
                        <Link
                          href="https://ivalt-api-portal.vercel.app/access/request"
                          className="email-cta"
                          style={{
                            display: "inline-block",
                            background: "#f3f4f6",
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: 600,
                            padding: "12px 28px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          Submit a New Request
                        </Link>
                      </td>
                    </tr>
                  </table>
                </Section>
              </div>
            </Section>

            <Section className="mt-5" style={{ textAlign: "center" as const, padding: "0 12px" }}>
              <Text
                className="email-footer-text m-0"
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  lineHeight: "1.6",
                }}
              >
                Questions? Contact{" "}
                <Link
                  href="mailto:support@ivalt.com"
                  style={{
                    fontSize: "12px",
                    color: "#611f69",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  support@ivalt.com
                </Link>
              </Text>
              <Text
                className="email-footer-text m-0"
                style={{
                  fontSize: "11px",
                  color: "#c4c4cc",
                  marginTop: "2px",
                }}
              >
                iVALT API Portal — Biometric Authentication Platform
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default UserRejected;
