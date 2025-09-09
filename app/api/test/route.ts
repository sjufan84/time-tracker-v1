import { NextResponse } from 'next/server';
import { projectUtils, taskUtils, timerUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    // Create a test project
    const project = projectUtils.create({
      name: 'Test Project',
      description: 'A test project for demonstration',
      color: '#10B981'
    });

    // Create a test task
    const task = taskUtils.create({
      project_id: project.id,
      name: 'Test Task',
      description: 'A test task for demonstration',
      status: 'active'
    });

    // Start a timer
    const timeEntry = timerUtils.start({
      task_id: task.id,
      description: 'Testing the timer functionality'
    });

    return NextResponse.json({
      message: 'Test data created successfully',
      data: {
        project,
        task,
        timeEntry
      }
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { error: 'Failed to create test data' },
      { status: 500 }
    );
  }
}
