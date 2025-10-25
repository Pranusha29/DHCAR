import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecordService } from '../../services/record.service';
import { UserService } from '../../services/user.service';
import { Record, CreateRecordRequest, Prescription } from '../../models/record.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid">
      <!-- Navigation -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div class="container">
          <a class="navbar-brand fw-bold" href="#">QUICKCARE</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/appointments" routerLinkActive="active">Appointments</a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" routerLink="/records" routerLinkActive="active">Medical Records</a>
              </li>
              <li class="nav-item" *ngIf="currentUser?.role === 'patient'">
                <a class="nav-link" routerLink="/doctors" routerLinkActive="active">Doctors</a>
              </li>
              <li class="nav-item" *ngIf="currentUser?.role === 'admin'">
                <a class="nav-link" routerLink="/admin" routerLinkActive="active">Admin Panel</a>
              </li>
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  {{ currentUser?.name }}
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/profile">Profile</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" (click)="logout()">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="container">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <h2 class="text-primary">Medical Records</h2>
              <button 
                *ngIf="currentUser?.role === 'doctor' || currentUser?.role === 'admin'"
                class="btn btn-primary"
                (click)="showCreateForm = !showCreateForm"
              >
                <i class="fas fa-plus me-2"></i>
                Add Medical Record
              </button>
            </div>
          </div>
        </div>

        <!-- Create Record Form -->
        <div class="row mb-4" *ngIf="showCreateForm">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">Add New Medical Record</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="recordForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="patientId" class="form-label">Patient</label>
                      <select
                        id="patientId"
                        class="form-select"
                        formControlName="patientId"
                        [class.is-invalid]="recordForm.get('patientId')?.invalid && recordForm.get('patientId')?.touched"
                      >
                        <option value="">Select a patient</option>
                        <option *ngFor="let patient of patients" [value]="patient._id">
                          {{ patient.name }} - {{ patient.email }}
                        </option>
                      </select>
                      <div *ngIf="recordForm.get('patientId')?.invalid && recordForm.get('patientId')?.touched" class="invalid-feedback">
                        Please select a patient
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="diagnosis" class="form-label">Diagnosis</label>
                      <input
                        type="text"
                        id="diagnosis"
                        class="form-control"
                        formControlName="diagnosis"
                        [class.is-invalid]="recordForm.get('diagnosis')?.invalid && recordForm.get('diagnosis')?.touched"
                        placeholder="Enter diagnosis"
                      />
                      <div *ngIf="recordForm.get('diagnosis')?.invalid && recordForm.get('diagnosis')?.touched" class="invalid-feedback">
                        Diagnosis is required
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="symptoms" class="form-label">Symptoms</label>
                      <input
                        type="text"
                        id="symptoms"
                        class="form-control"
                        formControlName="symptoms"
                        placeholder="Enter symptoms (comma-separated)"
                      />
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="followUpDate" class="form-label">Follow-up Date</label>
                      <input
                        type="date"
                        id="followUpDate"
                        class="form-control"
                        formControlName="followUpDate"
                      />
                    </div>
                  </div>

                  <!-- Prescription Section -->
                  <div class="mb-3">
                    <label class="form-label">Prescription</label>
                    <div formArrayName="prescription">
                      <div *ngFor="let prescription of prescriptionArray.controls; let i = index" class="card mb-3">
                        <div class="card-body" [formGroup]="$any(prescription)">
                          <div class="row">
                            <div class="col-md-3">
                              <label class="form-label">Medication</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="medication"
                                placeholder="Medication name"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Dosage</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="dosage"
                                placeholder="e.g., 500mg"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Frequency</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="frequency"
                                placeholder="e.g., 3x daily"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Duration</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="duration"
                                placeholder="e.g., 7 days"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Instructions</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="instructions"
                                placeholder="Special instructions"
                              />
                            </div>
                            <div class="col-md-1 d-flex align-items-end">
                              <button
                                type="button"
                                class="btn btn-outline-danger btn-sm"
                                (click)="removePrescription(i)"
                              >
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        (click)="addPrescription()"
                      >
                        <i class="fas fa-plus me-1"></i>
                        Add Medication
                      </button>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="notes" class="form-label">Additional Notes</label>
                    <textarea
                      id="notes"
                      class="form-control"
                      formControlName="notes"
                      rows="3"
                      placeholder="Any additional notes or observations"
                    ></textarea>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="recordForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isLoading ? 'Saving...' : 'Save Record' }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="showCreateForm = false"
                    >
                      Cancel
                    </button>
                  </div>

                  <div *ngIf="errorMessage" class="alert alert-danger mt-3" role="alert">
                    {{ errorMessage }}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Medical Record Form -->
        <div *ngIf="showEditForm" class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-warning text-white">
                <h5 class="card-title mb-0">
                  <i class="fas fa-edit me-2"></i>
                  Edit Medical Record
                </h5>
              </div>
              <div class="card-body">
                <form [formGroup]="editRecordForm" (ngSubmit)="onEditSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editPatientId" class="form-label">Patient</label>
                      <select
                        id="editPatientId"
                        class="form-select"
                        formControlName="patientId"
                        [class.is-invalid]="editRecordForm.get('patientId')?.invalid && editRecordForm.get('patientId')?.touched"
                      >
                        <option value="">Select a patient</option>
                        <option *ngFor="let patient of patients" [value]="patient._id">
                          {{ patient.name }} ({{ patient.email }})
                        </option>
                      </select>
                      <div *ngIf="editRecordForm.get('patientId')?.invalid && editRecordForm.get('patientId')?.touched" class="invalid-feedback">
                        Please select a patient
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="editDiagnosis" class="form-label">Diagnosis</label>
                      <input
                        type="text"
                        id="editDiagnosis"
                        class="form-control"
                        formControlName="diagnosis"
                        [class.is-invalid]="editRecordForm.get('diagnosis')?.invalid && editRecordForm.get('diagnosis')?.touched"
                        placeholder="Enter the diagnosis"
                      />
                      <div *ngIf="editRecordForm.get('diagnosis')?.invalid && editRecordForm.get('diagnosis')?.touched" class="invalid-feedback">
                        Diagnosis is required
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="editSymptoms" class="form-label">Symptoms</label>
                    <input
                      type="text"
                      id="editSymptoms"
                      class="form-control"
                      formControlName="symptoms"
                      placeholder="Enter symptoms separated by commas"
                    />
                    <div class="form-text">Separate multiple symptoms with commas</div>
                  </div>

                  <!-- Edit Prescription Section -->
                  <div class="mb-3">
                    <label class="form-label">Prescription</label>
                    <div formArrayName="prescription">
                      <div *ngFor="let prescription of editPrescriptionArray.controls; let i = index" class="card mb-3">
                        <div class="card-body" [formGroup]="$any(prescription)">
                          <div class="row">
                            <div class="col-md-3">
                              <label class="form-label">Medication</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="medication"
                                placeholder="Medication name"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Dosage</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="dosage"
                                placeholder="e.g., 500mg"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Duration</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="duration"
                                placeholder="e.g., 7 days"
                              />
                            </div>
                            <div class="col-md-2">
                              <label class="form-label">Instructions</label>
                              <input
                                type="text"
                                class="form-control"
                                formControlName="instructions"
                                placeholder="Special instructions"
                              />
                            </div>
                            <div class="col-md-1 d-flex align-items-end">
                              <button
                                type="button"
                                class="btn btn-outline-danger btn-sm"
                                (click)="removeEditPrescription(i)"
                              >
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        (click)="addEditPrescription()"
                      >
                        <i class="fas fa-plus me-2"></i>
                        Add Medication
                      </button>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editFollowUpDate" class="form-label">Follow-up Date</label>
                      <input
                        type="date"
                        id="editFollowUpDate"
                        class="form-control"
                        formControlName="followUpDate"
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="editNotes" class="form-label">Notes</label>
                    <textarea
                      id="editNotes"
                      class="form-control"
                      formControlName="notes"
                      rows="3"
                      placeholder="Any additional notes or observations"
                    ></textarea>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      class="btn btn-warning"
                      [disabled]="editRecordForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isLoading ? 'Updating...' : 'Update Record' }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="cancelEdit()"
                    >
                      Cancel
                    </button>
                  </div>

                  <div *ngIf="errorMessage" class="alert alert-danger mt-3" role="alert">
                    {{ errorMessage }}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Records List -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Medical Records</h5>
              </div>
              <div class="card-body">
                <div *ngIf="records.length === 0" class="text-center py-4">
                  <i class="fas fa-file-medical fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No medical records found</p>
                </div>

                <div *ngFor="let record of records" class="card mb-3">
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-8">
                        <h6 class="card-title">{{ record.diagnosis }}</h6>
                        <p class="card-text">
                          <strong>Patient:</strong> {{ record.patientId.name }}<br>
                          <strong>Doctor:</strong> {{ record.doctorId.name }}<br>
                          <strong>Date:</strong> {{ formatDate(record.createdAt) }}
                        </p>
                        <p *ngIf="record.symptoms.length > 0" class="card-text">
                          <strong>Symptoms:</strong> {{ record.symptoms.join(', ') }}
                        </p>
                        <p *ngIf="record.notes" class="card-text">
                          <strong>Notes:</strong> {{ record.notes }}
                        </p>
                      </div>
                      <div class="col-md-4">
                        <div class="d-flex justify-content-end">
                          <button
                            class="btn btn-outline-primary btn-sm me-2"
                            (click)="viewRecord(record)"
                          >
                            View Details
                          </button>
                          <button
                            *ngIf="canEditRecord(record)"
                            class="btn btn-outline-secondary btn-sm"
                            (click)="editRecord(record)"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 15px;
    }
    .btn {
      border-radius: 10px;
    }
  `]
})
export class RecordsComponent implements OnInit {
  currentUser: User | null = null;
  records: Record[] = [];
  patients: User[] = [];
  showCreateForm = false;
  showEditForm = false;
  editingRecord: Record | null = null;
  isLoading = false;
  errorMessage = '';

  recordForm: FormGroup;
  editRecordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private recordService: RecordService,
    private userService: UserService
  ) {
    this.recordForm = this.fb.group({
      patientId: ['', [Validators.required]],
      diagnosis: ['', [Validators.required]],
      symptoms: [''],
      prescription: this.fb.array([]),
      notes: [''],
      followUpDate: ['']
    });

    this.editRecordForm = this.fb.group({
      patientId: ['', [Validators.required]],
      diagnosis: ['', [Validators.required]],
      symptoms: [''],
      prescription: this.fb.array([]),
      notes: [''],
      followUpDate: ['']
    });
  }

  get prescriptionArray(): FormArray {
    return this.recordForm.get('prescription') as FormArray;
  }

  get editPrescriptionArray(): FormArray {
    return this.editRecordForm.get('prescription') as FormArray;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Current user in records:', user);
    });

    this.loadRecords();
    this.loadPatients();
  }

  loadRecords() {
    this.recordService.getRecords().subscribe({
      next: (response) => {
        this.records = response.records;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load medical records';
      }
    });
  }

  loadPatients() {
    if (this.currentUser?.role === 'admin' || this.currentUser?.role === 'doctor') {
      this.userService.getUsers({ role: 'patient' }).subscribe({
        next: (response) => {
          this.patients = response.users;
          console.log('Loaded patients:', this.patients);
        },
        error: (error) => {
          console.error('Error loading patients:', error);
        }
      });
    }
  }

  addPrescription() {
    const prescriptionGroup = this.fb.group({
      medication: ['', [Validators.required]],
      dosage: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      instructions: ['']
    });
    this.prescriptionArray.push(prescriptionGroup);
    console.log('Added prescription, total prescriptions:', this.prescriptionArray.length);
  }

  removePrescription(index: number) {
    this.prescriptionArray.removeAt(index);
  }

  onSubmit() {
    console.log('Form submitted');
    console.log('Form valid:', this.recordForm.valid);
    console.log('Form errors:', this.recordForm.errors);
    console.log('Form value:', this.recordForm.value);
    
    if (this.recordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.recordForm.value;
      const recordData: CreateRecordRequest = {
        patientId: formValue.patientId,
        diagnosis: formValue.diagnosis,
        symptoms: formValue.symptoms ? formValue.symptoms.split(',').map((s: string) => s.trim()) : [],
        prescription: formValue.prescription || [], // Handle empty prescription array
        notes: formValue.notes,
        followUpDate: formValue.followUpDate
      };

      console.log('Sending record data:', recordData);

      this.recordService.createRecord(recordData).subscribe({
        next: (response) => {
          console.log('Record created successfully:', response);
          this.isLoading = false;
          this.showCreateForm = false;
          this.recordForm.reset();
          this.prescriptionArray.clear();
          this.loadRecords();
        },
        error: (error) => {
          console.error('Error creating record:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to save medical record';
        }
      });
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
      Object.keys(this.recordForm.controls).forEach(key => {
        this.recordForm.get(key)?.markAsTouched();
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
  }

  canEditRecord(record: Record): boolean {
    return this.currentUser?.role === 'admin' || 
           record.doctorId._id === this.currentUser?._id;
  }

  viewRecord(record: Record) {
    // Show detailed view of the record
    const details = `
      Patient: ${record.patientId.name}
      Doctor: ${record.doctorId.name}
      Diagnosis: ${record.diagnosis}
      Symptoms: ${record.symptoms.join(', ')}
      Notes: ${record.notes || 'No notes'}
      Follow-up Date: ${record.followUpDate ? this.formatDate(record.followUpDate) : 'Not scheduled'}
      Prescription: ${record.prescription && record.prescription.length > 0 ? 
        record.prescription.map(p => `${p.medication} - ${p.dosage} - ${p.duration}`).join(', ') : 
        'No prescription'}
      Created: ${this.formatDate(record.createdAt)}
    `;
    
    alert(details);
  }

  editRecord(record: Record) {
    this.editingRecord = record;
    this.showEditForm = true;
    this.showCreateForm = false;
    
    // Clear existing prescription array
    while (this.editPrescriptionArray.length !== 0) {
      this.editPrescriptionArray.removeAt(0);
    }
    
    // Populate the edit form with record data
    this.editRecordForm.patchValue({
      patientId: record.patientId._id,
      diagnosis: record.diagnosis,
      symptoms: record.symptoms.join(', '),
      notes: record.notes,
      followUpDate: record.followUpDate ? this.formatDateForInput(record.followUpDate) : ''
    });

    // Add existing prescriptions to the form array
    if (record.prescription && record.prescription.length > 0) {
      record.prescription.forEach(prescription => {
        this.addEditPrescription(
          prescription.medication, 
          prescription.dosage, 
          prescription.duration,
          prescription.instructions || ''
        );
      });
    }
  }

  onEditSubmit() {
    if (this.editRecordForm.valid && this.editingRecord) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.editRecordForm.value;
      const recordData = {
        patientId: formValue.patientId,
        diagnosis: formValue.diagnosis,
        symptoms: formValue.symptoms ? formValue.symptoms.split(',').map((s: string) => s.trim()) : [],
        prescription: formValue.prescription || [],
        notes: formValue.notes,
        followUpDate: formValue.followUpDate
      };

      this.recordService.updateRecord(this.editingRecord._id, recordData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showEditForm = false;
          this.editingRecord = null;
          this.editRecordForm.reset();
          this.editPrescriptionArray.clear();
          this.loadRecords();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update medical record';
        }
      });
    }
  }

  cancelEdit() {
    this.showEditForm = false;
    this.editingRecord = null;
    this.editRecordForm.reset();
    this.editPrescriptionArray.clear();
    this.errorMessage = '';
  }

  addEditPrescription(medication: string = '', dosage: string = '', duration: string = '', instructions: string = '') {
    const prescriptionGroup = this.fb.group({
      medication: [medication, [Validators.required]],
      dosage: [dosage, [Validators.required]],
      duration: [duration, [Validators.required]],
      instructions: [instructions]
    });
    this.editPrescriptionArray.push(prescriptionGroup);
  }

  removeEditPrescription(index: number) {
    this.editPrescriptionArray.removeAt(index);
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
