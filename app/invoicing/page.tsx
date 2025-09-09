import InvoicingClient from '@/components/InvoicingClient';
import { queries } from '@/lib/database';
import { Project } from '@/lib/types';

export default function InvoicingPage() {
  const projects = queries.getAllProjects.all() as Project[];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Invoicing</h1>
      <InvoicingClient projects={projects} />
    </div>
  );
}
