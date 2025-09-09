"use client";

import { useState, useEffect } from 'react';
import { TimeEntry } from '@/lib/types';

export function useTimer() {
  const [activeTimers, setActiveTimers] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const fetchActiveTimers = async () => {
      const response = await fetch('/api/timer');
      const data = await response.json();
      if (response.ok) {
        setActiveTimers(data);
      }
    };
    fetchActiveTimers();
  }, []);

  const startTimer = async (task_id: number) => {
    const response = await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id }),
    });
    const newTimer = await response.json();
    if (response.ok) {
      setActiveTimers((prev) => [...prev, newTimer]);
    }
  };

  const stopTimer = async (time_entry_id: number) => {
    console.log('useTimer: Attempting to stop timer:', time_entry_id);
    const response = await fetch('/api/timer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time_entry_id }),
    });
    
    console.log('useTimer: Stop timer response:', response.status, response.statusText);
    
    if (response.ok) {
      setActiveTimers((prev) => prev.filter((timer) => timer.id !== time_entry_id));
    } else {
      const errorData = await response.json();
      console.error('useTimer: Failed to stop timer:', errorData);
    }
  };

  return { activeTimers, startTimer, stopTimer };
}
