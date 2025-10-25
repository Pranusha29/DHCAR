export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctorId: {
    _id: string;
    name: string;
    email: string;
    specialization?: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  notes?: string;
  duration: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
  notes?: string;
  duration?: number;
  patientId?: string; // For admin use
}

export interface UpdateAppointmentRequest {
  date?: string;
  time?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  notes?: string;
  duration?: number;
}
