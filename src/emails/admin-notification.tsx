import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
  Font,
  Tailwind,
} from "@react-email/components";

interface AdminNotificationProps {
  userName: string;
  userPhone: string;
  useCase: string;
  requestedAt: string;
}

export function AdminNotification({
  userName,
  userPhone,
  useCase,
  requestedAt,
}: AdminNotificationProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{ url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2", format: "woff2" }}
        />
      </Head>
      <Tailwind>
        <Body className="bg-[#f4f2f5] py-10">
          <Container className="mx-auto max-w-[520px]">
            <Section className="text-center mb-6">
              <Img src="https://ivalt-api-portal.vercel.app/logo.webp" alt="iVALT" width="32" height="32" style={{ margin: "0 auto" }} />
            </Section>

            <Section className="bg-white rounded-2xl shadow-sm p-8">
              <div style={{ width: "48px", height: "3px", background: "#611f69", borderRadius: "2px", margin: "0 auto 20px" }} />

              <Section className="text-center mb-6">
                <Heading className="text-lg font-semibold text-gray-900 m-0 tracking-[-0.02em]">
                  New Access Request
                </Heading>
                <Text className="text-sm text-gray-500 mt-1.5 m-0">
                  A user is requesting access to the iVALT Portal
                </Text>
              </Section>

              <Section className="mb-6">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tr>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                      <Text className="text-xs text-gray-400 m-0">Name</Text>
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #eee", textAlign: "right" }}>
                      <Text className="text-sm font-medium text-gray-900 m-0">{userName}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                      <Text className="text-xs text-gray-400 m-0">Phone</Text>
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #eee", textAlign: "right" }}>
                      <Text className="text-sm font-medium text-gray-900 m-0">{userPhone}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 0" }}>
                      <Text className="text-xs text-gray-400 m-0">Requested</Text>
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      <Text className="text-sm font-medium text-gray-900 m-0">{requestedAt}</Text>
                    </td>
                  </tr>
                </table>
              </Section>

              <Section className="mb-6">
                <Text className="text-xs text-gray-400 m-0 mb-2">USE CASE</Text>
                <div style={{ background: "#f8f7f9", borderRadius: "10px", padding: "14px 16px" }}>
                  <Text className="text-sm text-gray-700 m-0 leading-relaxed">{useCase}</Text>
                </div>
              </Section>

              <Hr className="border-gray-100 m-0 mb-5" />

              <Section className="text-center">
                <Text className="text-xs text-gray-400 m-0">
                  Review this request in your admin dashboard to approve or reject.
                </Text>
              </Section>
            </Section>

            <Section className="text-center mt-6">
              <Text className="text-xs text-gray-400 m-0">
                iVALT Developer Portal
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AdminNotification;
