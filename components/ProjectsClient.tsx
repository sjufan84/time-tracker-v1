"use client";

import { useState } from 'react';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import ProjectForm from './ProjectForm';
import Link from 'next/link';

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleFormSubmit = (project: Project) => {
    if (selectedProject) {
      // Update
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
      toast.success('Project updated successfully.');
    } else {
      // Create
      setProjects([...projects, project]);
      toast.success('Project created successfully.');
    }
    setIsFormOpen(false);
    setSelectedProject(null);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(projects.filter((p) => p.id !== id));
    toast.success('Project deleted successfully.');
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => {
          setSelectedProject(null);
          setIsFormOpen(true);
        }}>
          New Project
        </Button>
      </div>
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        project={selectedProject}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="font-semibold hover:underline">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.color}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProject(project);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(project.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
