import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
                <a class="nav-link" routerLink="/records" routerLinkActive="active">Medical Records</a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" routerLink="/doctors" routerLinkActive="active">Doctors</a>
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
            <h2 class="text-primary">Our Doctors</h2>
            <p class="text-muted">Find and book appointments with our qualified medical professionals</p>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search doctors by name or specialization..."
                [(ngModel)]="searchTerm"
                (input)="filterDoctors()"
              />
            </div>
          </div>
          <div class="col-md-6">
            <select
              class="form-select"
              [(ngModel)]="selectedSpecialization"
              (change)="filterDoctors()"
            >
              <option value="">All Specializations</option>
              <option *ngFor="let spec of specializations" [value]="spec">
                {{ spec }}
              </option>
            </select>
          </div>
        </div>

        <!-- Doctors Grid -->
        <div class="row">
          <div *ngIf="filteredDoctors.length === 0" class="col-12">
            <div class="text-center py-5">
              <i class="fas fa-user-md fa-3x text-muted mb-3"></i>
              <p class="text-muted">No doctors found matching your criteria</p>
            </div>
          </div>

          <div *ngFor="let doctor of filteredDoctors" class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="mb-3">
                  <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style="width: 80px; height: 80px;">
                    <i class="fas fa-user-md fa-2x text-white"></i>
                  </div>
                </div>
                
                <h5 class="card-title">{{ doctor.name }}</h5>
                <p class="text-muted mb-2">{{ doctor.specialization || 'General Practitioner' }}</p>
                <p class="text-muted mb-3">{{ doctor.email }}</p>
                
                <div *ngIf="doctor.phone" class="mb-2">
                  <i class="fas fa-phone me-2 text-muted"></i>
                  <small class="text-muted">{{ doctor.phone }}</small>
                </div>
                
                <div *ngIf="doctor.address" class="mb-3">
                  <i class="fas fa-map-marker-alt me-2 text-muted"></i>
                  <small class="text-muted">{{ doctor.address }}</small>
                </div>

                <div class="d-grid gap-2">
                  <button
                    class="btn btn-primary"
                    (click)="bookAppointment(doctor)"
                  >
                    <i class="fas fa-calendar-plus me-2"></i>
                    Book Appointment
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    (click)="viewDoctorProfile(doctor)"
                  >
                    <i class="fas fa-eye me-2"></i>
                    View Profile
                  </button>
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
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    .btn {
      border-radius: 10px;
    }
    .input-group-text {
      border-radius: 10px 0 0 10px;
    }
    .form-control, .form-select {
      border-radius: 0 10px 10px 0;
    }
  `]
})
export class DoctorsComponent implements OnInit {
  currentUser: User | null = null;
  doctors: User[] = [];
  filteredDoctors: User[] = [];
  searchTerm = '';
  selectedSpecialization = '';
  private _specializations: string[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadDoctors();
  }

  loadDoctors() {
    this.userService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
        this.extractSpecializations();
      },
      error: (error) => {
        console.error('Failed to load doctors:', error);
      }
    });
  }

  extractSpecializations() {
    const specializations = new Set<string>();
    this.doctors.forEach(doctor => {
      if (doctor.specialization) {
        specializations.add(doctor.specialization);
      }
    });
    this._specializations = Array.from(specializations).sort();
  }

  get specializations(): string[] {
    return this._specializations;
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSearch = !this.searchTerm || 
        doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (doctor.specialization && doctor.specialization.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesSpecialization = !this.selectedSpecialization || 
        doctor.specialization === this.selectedSpecialization;
      
      return matchesSearch && matchesSpecialization;
    });
  }

  bookAppointment(doctor: User) {
    // Navigate to appointments page with doctor pre-selected
    // This would typically pass the doctor ID as a query parameter
    console.log('Book appointment with:', doctor);
    // You could implement navigation here
  }

  viewDoctorProfile(doctor: User) {
    // Implement view doctor profile logic
    console.log('View doctor profile:', doctor);
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
