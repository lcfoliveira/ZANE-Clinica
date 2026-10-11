import { Physiotherapist, Patient, Appointment, CheckinRecord } from '../types';
import { 
  INITIAL_PHYSIOTHERAPISTS, 
  INITIAL_PATIENTS, 
  generateInitialAppointments, 
  generateInitialCheckins,
  getRelativeDate 
} from '../data/initialData';

// Cleanup any legacy demo and previous keys
try {
  [
    'zani_fisioterapeutas_v1', 'zani_pacientes_v1', 'zani_agendamentos_v1', 'zani_checkins_v1',
    'zani_fisioterapeutas_v2', 'zani_pacientes_v2', 'zani_agendamentos_v2', 'zani_checkins_v2',
    'zani_fisioterapeutas_v3', 'zani_pacientes_v3', 'zani_agendamentos_v3', 'zani_checkins_v3',
    'zani_fisioterapeutas_v4', 'zani_pacientes_v4', 'zani_agendamentos_v4', 'zani_checkins_v4',
    'zani_fisioterapeutas_v5', 'zani_pacientes_v5', 'zani_agendamentos_v5', 'zani_checkins_v5',
    'zani_fisioterapeutas_v6', 'zani_pacientes_v6', 'zani_agendamentos_v6', 'zani_checkins_v6',
    'zani_fisioterapeutas_real_v1', 'zani_pacientes_real_v1', 'zani_agendamentos_real_v1', 'zani_checkins_real_v1',
    'zane_fisioterapeutas_real_v1', 'zane_pacientes_real_v1', 'zane_agendamentos_real_v1', 'zane_checkins_real_v1'
  ].forEach(k => {
    if (localStorage.getItem(k)) {
      localStorage.removeItem(k);
    }
  });
} catch {}

const STORAGE_KEYS = {
  PHYSIOTHERAPISTS: 'zane_fisioterapeutas_real_v2',
  PATIENTS: 'zane_pacientes_real_v2',
  APPOINTMENTS: 'zane_agendamentos_real_v2',
  CHECKINS: 'zane_checkins_real_v2'
};

export const StorageService = {
  getPhysiotherapists(): Physiotherapist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PHYSIOTHERAPISTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PHYSIOTHERAPISTS, JSON.stringify(INITIAL_PHYSIOTHERAPISTS));
        return INITIAL_PHYSIOTHERAPISTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PHYSIOTHERAPISTS;
    }
  },

  savePhysiotherapists(data: Physiotherapist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PHYSIOTHERAPISTS, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar fisioterapeutas', e);
    }
  },

  addPhysiotherapist(fisio: Omit<Physiotherapist, 'id'>): Physiotherapist {
    const all = this.getPhysiotherapists();
    const newFisio: Physiotherapist = {
      ...fisio,
      id: `fisio-${Date.now()}`
    };
    all.push(newFisio);
    this.savePhysiotherapists(all);
    return newFisio;
  },

  updatePhysiotherapist(updated: Physiotherapist): void {
    const all = this.getPhysiotherapists().map(f => f.id === updated.id ? updated : f);
    this.savePhysiotherapists(all);
  },

  deletePhysiotherapist(id: string): void {
    const all = this.getPhysiotherapists().filter(f => f.id !== id);
    this.savePhysiotherapists(all);
  },

  // Patients
  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
        return INITIAL_PATIENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  savePatients(data: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar pacientes', e);
    }
  },

  addPatient(patient: Omit<Patient, 'id' | 'registeredAt'>): Patient {
    const all = this.getPatients();
    const newPatient: Patient = {
      ...patient,
      id: `pat-${Date.now()}`,
      registeredAt: getRelativeDate(0)
    };
    all.unshift(newPatient);
    this.savePatients(all);
    return newPatient;
  },

  updatePatient(updated: Patient): void {
    const all = this.getPatients().map(p => p.id === updated.id ? updated : p);
    this.savePatients(all);
  },

  deletePatient(id: string): void {
    const all = this.getPatients().filter(p => p.id !== id);
    this.savePatients(all);
  },

  // Appointments
  getAppointments(): Appointment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (!data) {
        const init = generateInitialAppointments();
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(init));
        return init;
      }
      return JSON.parse(data);
    } catch {
      return generateInitialAppointments();
    }
  },

  saveAppointments(data: Appointment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar agendamentos', e);
    }
  },

  addAppointment(appointment: Omit<Appointment, 'id' | 'status'>): Appointment {
    const all = this.getAppointments();
    const newApt: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'agendado'
    };
    all.push(newApt);
    this.saveAppointments(all);
    return newApt;
  },

  updateAppointment(updated: Appointment): void {
    const all = this.getAppointments().map(a => a.id === updated.id ? updated : a);
    this.saveAppointments(all);
  },

  deleteAppointment(id: string): void {
    const all = this.getAppointments().filter(a => a.id !== id);
    this.saveAppointments(all);
  },

  // Check-ins
  getCheckins(): CheckinRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKINS);
      if (!data) {
        const init = generateInitialCheckins();
        localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(init));
        return init;
      }
      return JSON.parse(data);
    } catch {
      return generateInitialCheckins();
    }
  },

  saveCheckins(data: CheckinRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar checkins', e);
    }
  },

  performCheckin(params: {
    appointmentId?: string;
    patientId: string;
    physiotherapistId: string;
    room: string;
    source: 'totem' | 'recepcao' | 'manual';
    notes?: string;
  }): { checkin: CheckinRecord; appointment?: Appointment } {
    const nowISO = new Date().toISOString();
    const allCheckins = this.getCheckins();

    const newCheckin: CheckinRecord = {
      id: `chk-${Date.now()}`,
      appointmentId: params.appointmentId,
      patientId: params.patientId,
      physiotherapistId: params.physiotherapistId,
      timestamp: nowISO,
      room: params.room,
      source: params.source,
      notes: params.notes
    };

    allCheckins.unshift(newCheckin);
    this.saveCheckins(allCheckins);

    let updatedApt: Appointment | undefined;

    // If linked to an appointment, update appointment status to 'checkin_realizado'
    if (params.appointmentId) {
      const allApts = this.getAppointments();
      const aptIndex = allApts.findIndex(a => a.id === params.appointmentId);
      if (aptIndex !== -1) {
        allApts[aptIndex] = {
          ...allApts[aptIndex],
          status: 'checkin_realizado',
          checkinTime: nowISO
        };
        updatedApt = allApts[aptIndex];
        this.saveAppointments(allApts);
      }
    }

    return { checkin: newCheckin, appointment: updatedApt };
  },

  // Reset database back to clean empty state
  resetToDemo(): void {
    localStorage.setItem(STORAGE_KEYS.PHYSIOTHERAPISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify([]));
  }
};
