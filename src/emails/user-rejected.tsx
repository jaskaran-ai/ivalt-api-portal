import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Font,
  Tailwind,
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
          webFont={{ url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2", format: "woff2" }}
        />
      </Head>
      <Tailwind>
        <Body className="bg-[#f4f2f5] py-10">
          <Container className="mx-auto max-w-[520px]">
            <Section className="text-center mb-6">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="iVALT" style={{ margin: "0 auto" }}>
                <rect width="36" height="36" rx="10" fill="#611f69" />
                <path d="M18 8L26 13V18.5C26 24 22.5 29 18 30.5C13.5 29 10 24 10 18.5V13L18 8Z" fill="white" />
                <path d="M15 18.5L17 20.5L21 16" stroke="#611f69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Section>

            <Section className="bg-white rounded-2xl shadow-sm p-8">
              <div style={{ width: "48px", height: "3px", background: "#611f69", borderRadius: "2px", margin: "0 auto 20px" }} />

              <Section className="text-center mb-6">
                <Heading className="text-lg font-semibold text-gray-900 m-0 tracking-[-0.02em]">
                  Access Request Update
                </Heading>
                <Text className="text-sm text-gray-500 mt-1.5 m-0">
                  Hello {userName}, regarding your access request
                </Text>
              </Section>

              <Section className="mb-6">
                <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="x" style={{ margin: "0 auto 8px" }}>
                    <rect x="3" y="3" width="18" height="18" rx="9" fill="#b91c1c" />
                    <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <Text className="text-sm text-[#b91c1c] m-0 leading-relaxed">
                    Your access request has been reviewed. At this time, we are
                    unable to approve your request. If you believe this is an error
                    or would like to discuss further, please reach out to the iVALT
                    support team.
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

export default UserRejected;
