import { NextRequest, NextResponse } from 'next/server';
import { taskUtils } from '@/lib/db-utils';
import type { CreateTaskRequest } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let tasks;
    if (projectId) {
      const id = parseInt(projectId);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid project ID' },
          { status: 400 }
        );
      }
      tasks = taskUtils.getByProject(id);
    } else {
      tasks = taskUtils.getAll();
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      );
    }

    if (!body.project_id || isNaN(body.project_id)) {
      return NextResponse.json(
        { error: 'Valid project ID is required' },
        { status: 400 }
      );
    }

    const task = taskUtils.create(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
