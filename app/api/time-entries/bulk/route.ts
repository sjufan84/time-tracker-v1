import { NextRequest, NextResponse } from 'next/server';
import { timeEntryUtils } from '@/lib/db-utils';
import type { BulkOperationResult, BulkOperationRequest } from '@/lib/types';

// Bulk operations for time entries
export async function POST(request: NextRequest) {
  try {
    const body: BulkOperationRequest = await request.json();
    const { action, time_entry_ids, data } = body;

    if (!action || !time_entry_ids || !Array.isArray(time_entry_ids)) {
      return NextResponse.json(
        { error: 'action and time_entry_ids array are required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    switch (action) {
      case 'stop':
        // Stop multiple active timers
        for (const id of time_entry_ids) {
          try {
            const result = timeEntryUtils.stop(id);
            if (result) {
              results.push({ id, success: true, data: result });
            } else {
              errors.push({ id, error: 'Time entry not found or already stopped' });
            }
          } catch (error) {
            console.error('Error stopping timer:', error);
            errors.push({ id, error: 'Failed to stop timer' });
          }
        }
        break;

      case 'delete':
        // Delete multiple time entries
        for (const id of time_entry_ids) {
          try {
            const success = timeEntryUtils.delete(id);
            if (success) {
              results.push({ id, success: true });
            } else {
              errors.push({ id, error: 'Time entry not found' });
            }
          } catch (error) {
            console.error('Error deleting time entry:', error);
            errors.push({ id, error: 'Failed to delete time entry' });
          }
        }
        break;

      case 'update':
        // Update multiple time entries with same data
        if (!data) {
          return NextResponse.json(
            { error: 'data is required for update action' },
            { status: 400 }
          );
        }

        for (const id of time_entry_ids) {
          try {
            const result = timeEntryUtils.update(id, data);
            if (result) {
              results.push({ id, success: true, data: result });
            } else {
              errors.push({ id, error: 'Time entry not found' });
            }
          } catch (error) {
            console.error('Error updating time entry:', error);
            errors.push({ id, error: 'Failed to update time entry' });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: stop, delete, update' },
          { status: 400 }
        );
    }

    const response: BulkOperationResult = {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: time_entry_ids.length,
        successful: results.length,
        failed: errors.length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
