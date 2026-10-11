import { Physiotherapist, Patient, Appointment, CheckinRecord } from '../types';

// Initial clean database for real clinical use
export const INITIAL_PHYSIOTHERAPISTS: Physiotherapist[] = [];

export const INITIAL_PATIENTS: Patient[] = [];

// Helper to format YYYY-MM-DD
export function getRelativeDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialAppointments(): Appointment[] {
  return [];
}

export function generateInitialCheckins(): CheckinRecord[] {
  return [];
}
