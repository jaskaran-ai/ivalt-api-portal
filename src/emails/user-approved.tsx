import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
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
        <Body className="bg-gray-50 py-10">
          <Container className="bg-white rounded-xl shadow-sm mx-auto p-8 max-w-[600px]">
            <Section className="text-center mb-6">
              <Text className="text-3xl font-bold text-[#611f69] m-0 tracking-tight">
                iVALT
              </Text>
              <Text className="text-sm text-gray-500 mt-1">Portal</Text>
            </Section>

            <Section className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Text className="text-3xl m-0">✅</Text>
              </div>
              <Heading className="text-xl text-gray-900 m-0">
                Access Approved
              </Heading>
              <Text className="text-gray-500 mt-2">
                Hello {userName}, your access request has been approved
              </Text>
            </Section>

            <Section className="bg-[#f0fdf4] rounded-lg border border-green-200 p-6 mb-6">
              <Text className="text-green-800 text-sm m-0 leading-relaxed">
                You can now log in to the iVALT Portal to manage your API keys
                and access the full range of features available to you.
              </Text>
            </Section>

            <Section className="text-center">
              <Text className="text-xs text-gray-400 m-0">
                If you have any questions, please contact the iVALT support team.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default UserApproved;
