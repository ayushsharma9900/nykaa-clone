import ClientHomePage from '@/components/ClientHomePage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return <ClientHomePage />;
}
