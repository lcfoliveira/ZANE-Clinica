export type SpecialtyType = 
  | 'Pilates Clínico & Postura'
  | 'Reabilitação Traumato-Ortopédica'
  | 'Fisioterapia Esportiva'
  | 'RPG & Cadeias Musculares'
  | 'Fisioterapia Neurofuncional'
  | 'Gerontologia & Mobilidade'
  | 'Saúde da Mulher & Pélvica';

export interface Physiotherapist {
  id: string;
  name: string;
  crefito: string;
  specialty: SpecialtyType;
  avatar: string;
  email: string;
  phone: string;
  room: string;
  color: string;
  workDays: string[]; // e.g. ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  workHours: { start: string; end: string };
  bio: string;
}

export type PatientPlan = 
  | 'Pilates 2x/semana'
  | 'Pilates 3x/semana'
  | 'Sessão Avulsa'
  | 'Reabilitação Intensiva'
  | 'Atendimento Domiciliar'
  | 'Gympass'
  | 'TotalPass';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  avatar?: string; // Patient photo (URL, local file data URL, or camera capture)
  email?: string;
  birthDate?: string;
  plan: PatientPlan;
  partnerId?: string; // Matrícula ou ID de validação (Gympass / TotalPass)
  designatedFisioId: string; // The specific physiotherapist determined for this patient
  chiefComplaint: string; // e.g. "Lombalgia crônica com irradiação ciática"
  clinicalNotes?: string;
  active: boolean;
  registeredAt: string;
}

export type AppointmentStatus = 
  | 'agendado'
  | 'checkin_realizado'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
  | 'falta';

export interface Appointment {
  id: string;
  patientId: string;
  physiotherapistId: string; // Designated physiotherapist
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  modality: string; // e.g. "Pilates Aparelhos", "Fisioterapia Motora", "RPG"
  room: string;
  status: AppointmentStatus;
  notes?: string;
  checkinTime?: string; // ISO string when checked in
  clinicalEvolution?: string; // Detailed clinical observation/progress during the session
  cancellationReason?: string; // Justification/reason when canceled
  canceledAt?: string; // Date/time when cancellation was registered
  attendedDurationMinutes?: number; // e.g. 50
}

export interface CheckinRecord {
  id: string;
  appointmentId?: string;
  patientId: string;
  physiotherapistId: string;
  timestamp: string; // ISO string
  room: string;
  source: 'totem' | 'recepcao' | 'manual';
  notes?: string;
}

export type TabKey = 
  | 'checkin'
  | 'agenda'
  | 'horarios'
  | 'pacientes'
  | 'fisioterapeutas'
  | 'indicadores';
