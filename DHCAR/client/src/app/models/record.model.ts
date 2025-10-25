export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabResult {
  testName: string;
  result: string;
  normalRange: string;
  date: string;
}

export interface Record {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  doctorId: {
    _id: string;
    name: string;
    email: string;
    specialization?: string;
    phone?: string;
  };
  appointmentId?: {
    _id: string;
    date: string;
    time: string;
    reason?: string;
  };
  diagnosis: string;
  symptoms: string[];
  prescription: Prescription[];
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  notes?: string;
  followUpDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordRequest {
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  symptoms?: string[];
  prescription?: Prescription[];
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  notes?: string;
  followUpDate?: string;
}

export interface UpdateRecordRequest {
  diagnosis?: string;
  symptoms?: string[];
  prescription?: Prescription[];
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  notes?: string;
  followUpDate?: string;
}
