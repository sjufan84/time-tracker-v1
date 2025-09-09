import TasksClient from '@/components/TasksClient';
import { use } from 'react';
import { queries } from '@/lib/database';
import { Project, Task } from '@/lib/types';
import { notFound } from 'next/navigation';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = queries.getProjectById.get(id) as Project;

  if (!project) {
    notFound();
  }

  const tasks = queries.getTasksByProject.all(id) as Task[];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="text-gray-500 mb-8">{project.description}</p>
      <TasksClient initialTasks={tasks} project={project} />
    </div>
  );
}
