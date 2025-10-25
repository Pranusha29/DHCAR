import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow-lg" style="width: 500px;">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-primary">Quickcare</h2>
            <p class="text-muted">Your Trusted Healthcare Partner</p>
            <h4 class="mt-3">Create Account</h4>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  class="form-control"
                  formControlName="name"
                  [class.is-invalid]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                  placeholder="Enter your full name"
                />
                <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" class="invalid-feedback">
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
                  [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  placeholder="Enter your email"
                />
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="invalid-feedback">
                  <div *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</div>
                  <div *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  formControlName="password"
                  [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  placeholder="Enter your password"
                />
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="invalid-feedback">
                  <div *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label for="role" class="form-label">Role</label>
                <select
                  id="role"
                  class="form-select"
                  formControlName="role"
                  [class.is-invalid]="registerForm.get('role')?.invalid && registerForm.get('role')?.touched"
                >
                  <option value="">Select your role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
                <div *ngIf="registerForm.get('role')?.invalid && registerForm.get('role')?.touched" class="invalid-feedback">
                  Please select a role
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

            <div class="mb-3">
              <label for="address" class="form-label">Address</label>
              <textarea
                id="address"
                class="form-control"
                formControlName="address"
                rows="2"
                placeholder="Enter your address"
              ></textarea>
            </div>

            <!-- Doctor-specific fields -->
            <div *ngIf="registerForm.get('role')?.value === 'doctor'" class="row">
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

            <div class="d-grid mb-3">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                [disabled]="registerForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
          </form>

          <div class="text-center">
            <p class="mb-0">Already have an account? 
              <a routerLink="/login" class="text-primary text-decoration-none">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
    .btn-primary {
      border-radius: 10px;
    }
    .form-control, .form-select {
      border-radius: 10px;
      border: 1px solid #e0e0e0;
    }
    .form-control:focus, .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]],
      phone: [''],
      address: [''],
      gender: [''],
      specialization: [''],
      licenseNumber: [''],
      dateOfBirth: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerData: RegisterRequest = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
