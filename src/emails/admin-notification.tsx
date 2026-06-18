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
        <Body className="bg-gray-50 py-10">
          <Container className="bg-white rounded-xl shadow-sm mx-auto p-8 max-w-[600px]">
            <Section className="text-center mb-6">
              <Text className="text-3xl font-bold text-[#611f69] m-0 tracking-tight">
                iVALT
              </Text>
              <Text className="text-sm text-gray-500 mt-1">Portal</Text>
            </Section>

            <Section className="bg-[#fefbff] rounded-lg border border-gray-100 p-6 mb-6">
              <Heading className="text-xl text-gray-900 m-0 mb-1">
                New Access Request
              </Heading>
              <Text className="text-gray-500 text-sm m-0">
                A user is requesting access to the iVALT Portal
              </Text>
            </Section>

            <Section className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <Text className="text-gray-500 text-sm m-0">Name</Text>
                  <Text className="text-gray-900 text-sm font-medium m-0">{userName}</Text>
                </div>
                <Hr className="border-gray-100 m-0" />
                <div className="flex justify-between">
                  <Text className="text-gray-500 text-sm m-0">Phone</Text>
                  <Text className="text-gray-900 text-sm font-medium m-0">{userPhone}</Text>
                </div>
                <Hr className="border-gray-100 m-0" />
                <div className="flex justify-between">
                  <Text className="text-gray-500 text-sm m-0">Requested At</Text>
                  <Text className="text-gray-900 text-sm font-medium m-0">{requestedAt}</Text>
                </div>
              </div>
            </Section>

            <Section className="mb-6">
              <Text className="text-gray-700 text-sm font-medium m-0 mb-2">Use Case</Text>
              <div className="bg-gray-50 rounded-lg p-4">
                <Text className="text-gray-900 text-sm m-0 leading-relaxed">{useCase}</Text>
              </div>
            </Section>

            <Section className="text-center">
              <Text className="text-xs text-gray-400 m-0">
                Review this request in the iVALT Portal admin dashboard
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AdminNotification;
