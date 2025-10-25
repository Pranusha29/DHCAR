import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
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
                <a class="nav-link" routerLink="/doctors" routerLinkActive="active">Doctors</a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" routerLink="/admin" routerLinkActive="active">Admin Panel</a>
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
            <h2 class="text-primary">Admin Panel</h2>
            <p class="text-muted">Manage users, appointments, and system settings</p>
          </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4" id="adminTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="users-tab" data-bs-toggle="tab" data-bs-target="#users" type="button" role="tab">
              <i class="fas fa-users me-2"></i>Users
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="doctors-tab" data-bs-toggle="tab" data-bs-target="#doctors" type="button" role="tab">
              <i class="fas fa-user-md me-2"></i>Doctors
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="patients-tab" data-bs-toggle="tab" data-bs-target="#patients" type="button" role="tab">
              <i class="fas fa-user me-2"></i>Patients
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="adminTabsContent">
          <!-- Users Tab -->
          <div class="tab-pane fade show active" id="users" role="tabpanel">
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search users..."
                    [(ngModel)]="searchTerm"
                    (input)="filterUsers()"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="selectedRole" (change)="filterUsers()">
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div class="col-md-3">
                <button class="btn btn-primary w-100" (click)="showCreateUserForm = !showCreateUserForm">
                  <i class="fas fa-plus me-2"></i>Add User
                </button>
              </div>
            </div>

            <!-- Create User Form -->
            <div *ngIf="showCreateUserForm" class="card mb-4">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">Create New User</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="userForm" (ngSubmit)="onCreateUser()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="name" class="form-label">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        class="form-control"
                        formControlName="name"
                        [class.is-invalid]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
                      />
                      <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="invalid-feedback">
                        Name is required
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Email</label>
                      <input
                        type="email"
                        id="email"
                        class="form-control"
                        formControlName="email"
                        [class.is-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                      />
                      <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="invalid-feedback">
                        <div *ngIf="userForm.get('email')?.errors?.['required']">Email is required</div>
                        <div *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email</div>
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
                        [class.is-invalid]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                      />
                      <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="invalid-feedback">
                        <div *ngIf="userForm.get('password')?.errors?.['required']">Password is required</div>
                        <div *ngIf="userForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="role" class="form-label">Role</label>
                      <select
                        id="role"
                        class="form-select"
                        formControlName="role"
                        [class.is-invalid]="userForm.get('role')?.invalid && userForm.get('role')?.touched"
                      >
                        <option value="">Select role</option>
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                      </select>
                      <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" class="invalid-feedback">
                        Please select a role
                      </div>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="userForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isLoading ? 'Creating...' : 'Create User' }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="showCreateUserForm = false"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Users Table -->
            <div class="card">
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let user of filteredUsers">
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="badge" [ngClass]="getRoleClass(user.role)">
                            {{ user.role }}
                          </span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                            {{ user.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="editUser(user)">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button 
                              class="btn btn-outline-warning" 
                              (click)="toggleUserStatus(user)"
                            >
                              <i class="fas" [ngClass]="user.isActive ? 'fa-ban' : 'fa-check'"></i>
                            </button>
                            <button 
                              class="btn btn-outline-danger" 
                              (click)="deleteUser(user._id)"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
    .nav-tabs .nav-link {
      border-radius: 10px 10px 0 0;
    }
    .table {
      border-radius: 10px;
    }
  `]
})
export class AdminComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  selectedRole = '';
  showCreateUserForm = false;
  isLoading = false;
  errorMessage = '';

  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]],
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
    });

    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = this.users;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users';
      }
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  onCreateUser() {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData = this.userForm.value;

      this.userService.createUser(userData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.showCreateUserForm = false;
          this.userForm.reset();
          this.loadUsers();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create user';
        }
      });
    }
  }

  editUser(user: User) {
    // Implement edit user logic
    console.log('Edit user:', user);
  }

  toggleUserStatus(user: User) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.userService.updateUserStatus(user._id, newStatus).subscribe({
        next: () => {
          user.isActive = newStatus;
        },
        error: (error) => {
          this.errorMessage = `Failed to ${action} user`;
        }
      });
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete user';
        }
      });
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'doctor': return 'bg-primary';
      case 'patient': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
