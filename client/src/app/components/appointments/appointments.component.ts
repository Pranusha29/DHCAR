import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { UserService } from '../../services/user.service';
import { Appointment, CreateAppointmentRequest } from '../../models/appointment.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-appointments',
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
                <a class="nav-link active" routerLink="/appointments" routerLinkActive="active">Appointments</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/records" routerLinkActive="active">Medical Records</a>
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
              <h2 class="text-primary">Appointments</h2>
              <button 
                *ngIf="currentUser?.role === 'patient' || currentUser?.role === 'admin'"
                class="btn btn-primary"
                (click)="showCreateForm = !showCreateForm"
              >
                <i class="fas fa-plus me-2"></i>
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        <!-- Create Appointment Form -->
        <div class="row mb-4" *ngIf="showCreateForm">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">Book New Appointment</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="doctorId" class="form-label">Doctor</label>
                      <select
                        id="doctorId"
                        class="form-select"
                        formControlName="doctorId"
                        [class.is-invalid]="appointmentForm.get('doctorId')?.invalid && appointmentForm.get('doctorId')?.touched"
                      >
                        <option value="">Select a doctor</option>
                        <option *ngFor="let doctor of doctors" [value]="doctor._id">
                          {{ doctor.name }} - {{ doctor.specialization }}
                        </option>
                      </select>
                      <div *ngIf="appointmentForm.get('doctorId')?.invalid && appointmentForm.get('doctorId')?.touched" class="invalid-feedback">
                        Please select a doctor
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="date" class="form-label">Date</label>
                      <input
                        type="date"
                        id="date"
                        class="form-control"
                        formControlName="date"
                        [class.is-invalid]="appointmentForm.get('date')?.invalid && appointmentForm.get('date')?.touched"
                        [min]="getMinDate()"
                      />
                      <div *ngIf="appointmentForm.get('date')?.invalid && appointmentForm.get('date')?.touched" class="invalid-feedback">
                        Please select a date
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="time" class="form-label">Time</label>
                      <input
                        type="time"
                        id="time"
                        class="form-control"
                        formControlName="time"
                        [class.is-invalid]="appointmentForm.get('time')?.invalid && appointmentForm.get('time')?.touched"
                      />
                      <div *ngIf="appointmentForm.get('time')?.invalid && appointmentForm.get('time')?.touched" class="invalid-feedback">
                        Please select a time
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="reason" class="form-label">Reason for Visit</label>
                      <input
                        type="text"
                        id="reason"
                        class="form-control"
                        formControlName="reason"
                        placeholder="Brief description of your concern"
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="notes" class="form-label">Additional Notes</label>
                    <textarea
                      id="notes"
                      class="form-control"
                      formControlName="notes"
                      rows="3"
                      placeholder="Any additional information you'd like to share"
                    ></textarea>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="appointmentForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isLoading ? 'Booking...' : 'Book Appointment' }}
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

        <!-- Edit Appointment Form -->
        <div *ngIf="showEditForm" class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-warning text-white">
                <h5 class="card-title mb-0">
                  <i class="fas fa-edit me-2"></i>
                  Edit Appointment
                </h5>
              </div>
              <div class="card-body">
                <form [formGroup]="editAppointmentForm" (ngSubmit)="onEditSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editDoctorId" class="form-label">Doctor</label>
                      <select
                        id="editDoctorId"
                        class="form-select"
                        formControlName="doctorId"
                        [class.is-invalid]="editAppointmentForm.get('doctorId')?.invalid && editAppointmentForm.get('doctorId')?.touched"
                      >
                        <option value="">Select a doctor</option>
                        <option *ngFor="let doctor of doctors" [value]="doctor._id">
                          {{ doctor.name }} - {{ doctor.specialization }}
                        </option>
                      </select>
                      <div *ngIf="editAppointmentForm.get('doctorId')?.invalid && editAppointmentForm.get('doctorId')?.touched" class="invalid-feedback">
                        Please select a doctor
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="editDate" class="form-label">Date</label>
                      <input
                        type="date"
                        id="editDate"
                        class="form-control"
                        formControlName="date"
                        [class.is-invalid]="editAppointmentForm.get('date')?.invalid && editAppointmentForm.get('date')?.touched"
                        [min]="getMinDate()"
                      />
                      <div *ngIf="editAppointmentForm.get('date')?.invalid && editAppointmentForm.get('date')?.touched" class="invalid-feedback">
                        Please select a date
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editTime" class="form-label">Time</label>
                      <input
                        type="time"
                        id="editTime"
                        class="form-control"
                        formControlName="time"
                        [class.is-invalid]="editAppointmentForm.get('time')?.invalid && editAppointmentForm.get('time')?.touched"
                      />
                      <div *ngIf="editAppointmentForm.get('time')?.invalid && editAppointmentForm.get('time')?.touched" class="invalid-feedback">
                        Please select a time
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="editReason" class="form-label">Reason for Visit</label>
                      <input
                        type="text"
                        id="editReason"
                        class="form-control"
                        formControlName="reason"
                        placeholder="Brief description of your concern"
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="editNotes" class="form-label">Additional Notes</label>
                    <textarea
                      id="editNotes"
                      class="form-control"
                      formControlName="notes"
                      rows="3"
                      placeholder="Any additional information you'd like to share"
                    ></textarea>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      class="btn btn-warning"
                      [disabled]="editAppointmentForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isLoading ? 'Updating...' : 'Update Appointment' }}
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

        <!-- Appointments List -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Your Appointments</h5>
              </div>
              <div class="card-body">
                <div *ngIf="appointments.length === 0" class="text-center py-4">
                  <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No appointments found</p>
                </div>

                <div *ngFor="let appointment of appointments" class="card mb-3">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-md-3">
                        <h6 class="mb-1">{{ appointment.patientId.name }}</h6>
                        <small class="text-muted">{{ appointment.patientId.email }}</small>
                      </div>
                      <div class="col-md-2">
                        <h6 class="mb-1">{{ appointment.doctorId.name }}</h6>
                        <small class="text-muted">{{ appointment.doctorId.specialization }}</small>
                      </div>
                      <div class="col-md-2">
                        <strong>{{ formatDate(appointment.date) }}</strong><br>
                        <small class="text-muted">{{ appointment.time }}</small>
                      </div>
                      <div class="col-md-2">
                        <span class="badge" [ngClass]="getStatusClass(appointment.status)">
                          {{ appointment.status }}
                        </span>
                      </div>
                      <div class="col-md-2">
                        <p class="mb-1">{{ appointment.reason || 'No reason specified' }}</p>
                      </div>
                      <div class="col-md-1">
                        <div class="dropdown">
                          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Actions
                          </button>
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" (click)="viewAppointment(appointment)">View Details</a></li>
                            <li *ngIf="canEditAppointment(appointment)">
                              <a class="dropdown-item" (click)="editAppointment(appointment)">Edit</a>
                            </li>
                            <li *ngIf="canCancelAppointment(appointment)">
                              <a class="dropdown-item text-danger" (click)="cancelAppointment(appointment._id)">Cancel</a>
                            </li>
                          </ul>
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
    .badge {
      border-radius: 20px;
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  currentUser: User | null = null;
  appointments: Appointment[] = [];
  doctors: User[] = [];
  showCreateForm = false;
  showEditForm = false;
  editingAppointment: Appointment | null = null;
  isLoading = false;
  errorMessage = '';

  appointmentForm: FormGroup;
  editAppointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private userService: UserService
  ) {
    this.appointmentForm = this.fb.group({
      doctorId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      reason: [''],
      notes: ['']
    });

    this.editAppointmentForm = this.fb.group({
      doctorId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      reason: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadAppointments();
    this.loadDoctors();
  }

  loadAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.appointments = response.appointments;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointments';
      }
    });
  }

  loadDoctors() {
    this.userService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      }
    });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const appointmentData: CreateAppointmentRequest = this.appointmentForm.value;

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showCreateForm = false;
          this.appointmentForm.reset();
          this.loadAppointments();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to book appointment';
        }
      });
    }
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'no-show': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  canEditAppointment(appointment: Appointment): boolean {
    return appointment.status === 'scheduled' && 
           (this.currentUser?.role === 'admin' || 
            appointment.patientId._id === this.currentUser?._id ||
            appointment.doctorId._id === this.currentUser?._id);
  }

  canCancelAppointment(appointment: Appointment): boolean {
    return appointment.status === 'scheduled' && 
           (this.currentUser?.role === 'admin' || 
            appointment.patientId._id === this.currentUser?._id);
  }

  viewAppointment(appointment: Appointment) {
    // Show detailed view of the appointment
    const details = `
      Patient: ${appointment.patientId.name}
      Doctor: ${appointment.doctorId.name}
      Date: ${this.formatDate(appointment.date)}
      Time: ${appointment.time}
      Status: ${appointment.status}
      Reason: ${appointment.reason || 'No reason specified'}
      Notes: ${appointment.notes || 'No notes'}
      Created: ${this.formatDate(appointment.createdAt)}
    `;
    
    alert(details);
  }

  editAppointment(appointment: Appointment) {
    this.editingAppointment = appointment;
    this.showEditForm = true;
    this.showCreateForm = false;
    
    // Populate the edit form with appointment data
    this.editAppointmentForm.patchValue({
      doctorId: appointment.doctorId._id,
      date: this.formatDateForInput(appointment.date),
      time: appointment.time,
      reason: appointment.reason,
      notes: appointment.notes
    });
  }

  onEditSubmit() {
    if (this.editAppointmentForm.valid && this.editingAppointment) {
      this.isLoading = true;
      this.errorMessage = '';

      const updateData = this.editAppointmentForm.value;
      
      this.appointmentService.updateAppointment(this.editingAppointment._id, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showEditForm = false;
          this.editingAppointment = null;
          this.editAppointmentForm.reset();
          this.loadAppointments();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update appointment';
        }
      });
    }
  }

  cancelEdit() {
    this.showEditForm = false;
    this.editingAppointment = null;
    this.editAppointmentForm.reset();
    this.errorMessage = '';
  }

  cancelAppointment(appointmentId: string) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.updateAppointment(appointmentId, { status: 'cancelled' }).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          this.errorMessage = 'Failed to cancel appointment';
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
