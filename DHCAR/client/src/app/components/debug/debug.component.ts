import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Debug Information</h2>
      
      <div class="card mb-3">
        <div class="card-header">
          <h5>Current User</h5>
        </div>
        <div class="card-body">
          <pre>{{ currentUser | json }}</pre>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">
          <h5>Patients List</h5>
        </div>
        <div class="card-body">
          <pre>{{ patients | json }}</pre>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">
          <h5>Test Actions</h5>
        </div>
        <div class="card-body">
          <button class="btn btn-primary me-2" (click)="loadPatients()">Load Patients</button>
          <button class="btn btn-secondary me-2" (click)="testLogout()">Test Logout</button>
          <button class="btn btn-info" (click)="checkAuth()">Check Auth</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DebugComponent implements OnInit {
  currentUser: User | null = null;
  patients: User[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Debug - Current user:', user);
    });
  }

  loadPatients() {
    console.log('Loading patients...');
    this.userService.getUsers({ role: 'patient' }).subscribe({
      next: (response) => {
        this.patients = response.users;
        console.log('Patients loaded:', this.patients);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  testLogout() {
    console.log('Testing logout...');
    this.authService.logout();
    console.log('Logout completed');
  }

  checkAuth() {
    console.log('Auth status:', this.authService.isAuthenticated());
    console.log('Token:', this.authService.getToken());
  }
}
