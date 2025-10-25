import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
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
                  <li><a class="dropdown-item active" routerLink="/profile" routerLinkActive="active">Profile</a></li>
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
            <h2 class="text-primary">My Profile</h2>
            <p class="text-muted">Manage your personal information and account settings</p>
          </div>
        </div>

        <div class="row">
          <!-- Profile Information -->
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">Personal Information</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="name" class="form-label">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        class="form-control"
                        formControlName="name"
                        [class.is-invalid]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                      />
                      <div *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched" class="invalid-feedback">
                        Name is required
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        class="form-control"
                        formControlName="email"
                        [class.is-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                      />
                      <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="invalid-feedback">
                        <div *ngIf="profileForm.get('email')?.errors?.['required']">Email is required</div>
                        <div *ngIf="profileForm.get('email')?.errors?.['email']">Please enter a valid email</div>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        class="form-control"
                        formControlName="phone"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="gender" class="form-label">Gender</label>
                      <select
                        id="gender"
                        class="form-select"
                        formControlName="gender"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="dateOfBirth" class="form-label">Date of Birth</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        class="form-control"
                        formControlName="dateOfBirth"
                      />
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="role" class="form-label">Role</label>
                      <input
                        type="text"
                        id="role"
                        class="form-control"
                        [value]="currentUser?.role"
                        disabled
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="address" class="form-label">Address</label>
                    <textarea
                      id="address"
                      class="form-control"
                      formControlName="address"
                      rows="3"
                      placeholder="Enter your address"
                    ></textarea>
                  </div>

                  <!-- Doctor-specific fields -->
                  <div *ngIf="currentUser?.role === 'doctor'" class="row">
                    <div class="col-md-6 mb-3">
                      <label for="specialization" class="form-label">Specialization</label>
                      <input
                        type="text"
                        id="specialization"
                        class="form-control"
                        formControlName="specialization"
                        placeholder="e.g., Cardiology, Neurology"
                      />
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="licenseNumber" class="form-label">License Number</label>
                      <input
                        type="text"
                        id="licenseNumber"
                        class="form-control"
                        formControlName="licenseNumber"
                        placeholder="Enter your license number"
                      />
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="profileForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isLoading ? 'Updating...' : 'Update Profile' }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="resetForm()"
                    >
                      Reset
                    </button>
                  </div>

                  <div *ngIf="errorMessage" class="alert alert-danger mt-3" role="alert">
                    {{ errorMessage }}
                  </div>

                  <div *ngIf="successMessage" class="alert alert-success mt-3" role="alert">
                    {{ successMessage }}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Profile Summary -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body text-center">
                <div class="mb-3">
                  <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style="width: 100px; height: 100px;">
                    <i class="fas fa-user fa-3x text-white"></i>
                  </div>
                </div>
                <h5 class="card-title">{{ currentUser?.name }}</h5>
                <p class="text-muted">{{ currentUser?.email }}</p>
                <span class="badge" [ngClass]="getRoleClass(currentUser?.role)">
                  {{ currentUser?.role }}
                </span>
              </div>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-header bg-info text-white">
                <h6 class="card-title mb-0">Account Information</h6>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <strong>Member Since:</strong><br>
                  <small class="text-muted">{{ formatDate(currentUser?.createdAt) }}</small>
                </div>
                <div class="mb-2">
                  <strong>Last Updated:</strong><br>
                  <small class="text-muted">{{ formatDate(currentUser?.updatedAt) }}</small>
                </div>
                <div class="mb-2">
                  <strong>Status:</strong><br>
                  <span class="badge" [ngClass]="currentUser?.isActive ? 'bg-success' : 'bg-danger'">
                    {{ currentUser?.isActive ? 'Active' : 'Inactive' }}
                  </span>
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
    .form-control, .form-select {
      border-radius: 10px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      specialization: [''],
      licenseNumber: [''],
      dateOfBirth: [''],
      gender: ['']
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender
        });
      }
    });
  }

  onUpdateProfile() {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updateData = this.profileForm.value;

      // Check if user ID exists
      if (!this.currentUser._id) {
        this.errorMessage = 'User ID not found. Please log out and log in again.';
        this.isLoading = false;
        return;
      }

      this.userService.updateUser(this.currentUser._id, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully';
          
          // Update current user in auth service
          if (response.user) {
            this.authService.updateCurrentUser(response.user);
            // Update the current user in this component
            this.currentUser = response.user;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update profile';
        }
      });
    }
  }

  resetForm() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
        address: this.currentUser.address,
        specialization: this.currentUser.specialization,
        licenseNumber: this.currentUser.licenseNumber,
        dateOfBirth: this.currentUser.dateOfBirth,
        gender: this.currentUser.gender
      });
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  getRoleClass(role?: string): string {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'doctor': return 'bg-primary';
      case 'patient': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
