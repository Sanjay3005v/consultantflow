
import { notFound } from 'next/navigation';
import { getConsultantById } from '@/lib/data';
import ConsultantDashboard from '@/components/consultant-dashboard';


// This is the server component that fetches the data
export default async function ConsultantPage({ params }: { params: { id: string } }) {
  const consultant = await getConsultantById(params.id);

  if (!consultant) {
    notFound();
  }

  // It then renders the client component with the fetched data
  return <ConsultantDashboard initialConsultant={consultant} />;
}
