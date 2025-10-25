import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow-lg" style="width: 400px;">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-primary">Quickcare</h2>
            <p class="text-muted">Your Trusted Healthcare Partner</p>
            <h4 class="mt-3">Sign In</h4>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="email" class="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                class="form-control"
                formControlName="email"
                [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                placeholder="Enter your email"
              />
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="invalid-feedback">
                <div *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</div>
                <div *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</div>
              </div>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                id="password"
                class="form-control"
                formControlName="password"
                [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="Enter your password"
              />
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="invalid-feedback">
                Password is required
              </div>
            </div>

            <div class="d-grid mb-3">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                [disabled]="loginForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isLoading ? 'Signing In...' : 'Sign In' }}
              </button>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
          </form>

          <div class="text-center">
            <p class="mb-0">Don't have an account? 
              <a routerLink="/register" class="text-primary text-decoration-none">Sign up here</a>
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
    .form-control {
      border-radius: 10px;
      border: 1px solid #e0e0e0;
    }
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
