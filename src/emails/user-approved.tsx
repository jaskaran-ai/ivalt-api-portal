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

interface UserApprovedProps {
  userName: string;
}

export function UserApproved({ userName }: UserApprovedProps) {
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
                  Access Approved
                </Heading>
                <Text className="text-sm text-gray-500 mt-1.5 m-0">
                  Hello {userName}, your request has been approved
                </Text>
              </Section>

              <Section className="mb-6">
                <div style={{ background: "#f1faf1", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="check" style={{ margin: "0 auto 8px" }}>
                    <rect x="3" y="3" width="18" height="18" rx="9" fill="#1b7a1b" />
                    <path d="M8 12.5L11 15.5L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <Text className="text-sm text-[#1b7a1b] m-0 leading-relaxed">
                    You can now log in to the iVALT Portal to manage your API keys
                    and access the full range of features available to you.
                  </Text>
                </div>
              </Section>

              <Hr className="border-gray-100 m-0 mb-5" />

              <Section className="text-center">
                <Text className="text-xs text-gray-400 m-0">
                  If you have any questions, contact the iVALT support team.
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

export default UserApproved;
