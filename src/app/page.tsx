import ClientHomePageWrapper from '@/components/ClientHomPageWrapper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return <ClientHomePageWrapper />;
}
