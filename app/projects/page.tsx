import ProjectsClient from '@/components/ProjectsClient';
import { queries } from '@/lib/database';
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const projects = queries.getAllProjects.all() as Project[];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      <ProjectsClient initialProjects={projects} />
    </div>
  );
}
