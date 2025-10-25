import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { RecordService } from '../../services/record.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
        <!-- Welcome Section -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <h2 class="card-title text-primary mb-2">
                  Welcome back, {{ currentUser?.name }}!
                </h2>
                <p class="card-text text-muted">
                  {{ getWelcomeMessage() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'patient' || currentUser?.role === 'admin'">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="text-primary mb-2">
                  <i class="fas fa-calendar-alt fa-2x"></i>
                </div>
                <h5 class="card-title">Upcoming Appointments</h5>
                <h3 class="text-primary">{{ upcomingAppointments }}</h3>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'doctor' || currentUser?.role === 'admin'">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="text-success mb-2">
                  <i class="fas fa-user-md fa-2x"></i>
                </div>
                <h5 class="card-title">Today's Appointments</h5>
                <h3 class="text-success">{{ todaysAppointments }}</h3>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'patient' || currentUser?.role === 'admin'">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="text-info mb-2">
                  <i class="fas fa-file-medical fa-2x"></i>
                </div>
                <h5 class="card-title">Medical Records</h5>
                <h3 class="text-info">{{ totalRecords }}</h3>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'admin'">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="text-warning mb-2">
                  <i class="fas fa-users fa-2x"></i>
                </div>
                <h5 class="card-title">Total Users</h5>
                <h3 class="text-warning">{{ totalUsers }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'patient'">
                    <button class="btn btn-outline-primary w-100" routerLink="/appointments">
                      <i class="fas fa-calendar-plus me-2"></i>
                      Book Appointment
                    </button>
                  </div>
                  
                  <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'doctor'">
                    <button class="btn btn-outline-success w-100" routerLink="/records">
                      <i class="fas fa-file-medical me-2"></i>
                      Add Medical Record
                    </button>
                  </div>
                  
                  <div class="col-md-3 mb-3" *ngIf="currentUser?.role === 'admin'">
                    <button class="btn btn-outline-warning w-100" routerLink="/admin">
                      <i class="fas fa-cog me-2"></i>
                      Manage Users
                    </button>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-outline-info w-100" routerLink="/profile">
                      <i class="fas fa-user me-2"></i>
                      View Profile
                    </button>
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
    .navbar-brand {
      font-size: 1.5rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  upcomingAppointments = 0;
  todaysAppointments = 0;
  totalRecords = 0;
  totalUsers = 0;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private recordService: RecordService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load upcoming appointments
    this.appointmentService.getAppointments({ status: 'scheduled' }).subscribe({
      next: (response) => {
        this.upcomingAppointments = response.total;
      }
    });

    // Load today's appointments
    const today = new Date().toISOString().split('T')[0];
    this.appointmentService.getAppointments({ date: today }).subscribe({
      next: (response) => {
        this.todaysAppointments = response.total;
      }
    });

    // Load total records
    this.recordService.getRecords().subscribe({
      next: (response) => {
        this.totalRecords = response.total;
      }
    });
  }

  getWelcomeMessage(): string {
    if (!this.currentUser) return '';
    
    const role = this.currentUser.role;
    const hour = new Date().getHours();
    
    let greeting = '';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    switch (role) {
      case 'patient':
        return `${greeting}! Here's your health dashboard. You can book appointments, view your medical records, and manage your health information.`;
      case 'doctor':
        return `${greeting}! Welcome to your medical dashboard. You can view your appointments, update patient records, and manage your schedule.`;
      case 'admin':
        return `${greeting}! Welcome to the admin panel. You can manage users, appointments, and system settings.`;
      default:
        return `${greeting}! Welcome to DHCAR.`;
    }
  }

  logout() {
    this.authService.logout();
    // Force a complete page reload to clear all state
    window.location.href = '/login';
  }
}
