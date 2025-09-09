"use client";

import { useState, useEffect } from 'react';
import { TimeEntry } from '@/lib/types';

export function useTimer() {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  useEffect(() => {
    const fetchActiveTimer = async () => {
      const response = await fetch('/api/timer');
      const data = await response.json();
      if (response.ok) {
        setActiveTimer(data);
      }
    };
    fetchActiveTimer();
  }, []);

  const startTimer = async (task_id: number) => {
    const response = await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id }),
    });
    const data = await response.json();
    if (response.ok) {
      setActiveTimer(data);
    }
  };

  const stopTimer = async (time_entry_id: number) => {
    const response = await fetch('/api/timer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time_entry_id }),
    });
    if (response.ok) {
      setActiveTimer(null);
    }
  };

  return { activeTimer, startTimer, stopTimer };
}
