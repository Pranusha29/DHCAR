import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="welcome-container">
      <!-- Background Elements -->
      <div class="background-elements">
        <div class="stethoscope"></div>
        <div class="heartbeat"></div>
        <div class="medical-cross"></div>
        <div class="pulse-dots"></div>
      </div>
      
      <!-- Main Content -->
      <div class="welcome-content">
        <div class="welcome-card">
          <div class="logo-section">
            <div class="logo">
              <i class="fas fa-heartbeat"></i>
              <h1>Quickcare</h1>
            </div>
            <p class="tagline">Your Trusted Healthcare Partner</p>
            <p class="description">
              Experience seamless healthcare management with our advanced digital platform. 
              Book appointments, manage records, and connect with healthcare professionals 
              all in one place.
            </p>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary btn-lg" routerLink="/login">
              <i class="fas fa-sign-in-alt me-2"></i>
              Sign In
            </button>
            <button class="btn btn-outline-primary btn-lg" routerLink="/register">
              <i class="fas fa-user-plus me-2"></i>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .background-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .stethoscope {
      position: absolute;
      top: 10%;
      right: 10%;
      width: 200px;
      height: 200px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 50 Q30 30 50 50 Q70 30 80 50" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/><circle cx="20" cy="50" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="50" r="3" fill="rgba(255,255,255,0.1)"/></svg>') no-repeat center;
      background-size: contain;
      animation: float 6s ease-in-out infinite;
    }

    .heartbeat {
      position: absolute;
      top: 20%;
      left: 5%;
      width: 150px;
      height: 100px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><path d="M10 25 L20 10 L30 25 L40 5 L50 25 L60 15 L70 25 L80 20 L90 25" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/></svg>') no-repeat center;
      background-size: contain;
      animation: pulse 4s ease-in-out infinite;
    }

    .medical-cross {
      position: absolute;
      bottom: 15%;
      right: 15%;
      width: 100px;
      height: 100px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="45" y="20" width="10" height="60" fill="rgba(255,255,255,0.1)"/><rect x="20" y="45" width="60" height="10" fill="rgba(255,255,255,0.1)"/></svg>') no-repeat center;
      background-size: contain;
      animation: rotate 8s linear infinite;
    }

    .pulse-dots {
      position: absolute;
      top: 50%;
      left: 8%;
      width: 80px;
      height: 80px;
    }

    .pulse-dots::before,
    .pulse-dots::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .pulse-dots::before {
      top: 0;
      left: 0;
    }

    .pulse-dots::after {
      bottom: 0;
      right: 0;
      animation-delay: 1s;
    }

    .welcome-content {
      position: relative;
      z-index: 10;
      text-align: center;
      color: white;
    }

    .welcome-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 600px;
      margin: 0 auto;
    }

    .logo-section {
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .logo i {
      font-size: 3rem;
      color: #ff6b6b;
      animation: heartbeat 2s ease-in-out infinite;
    }

    .logo h1 {
      font-size: 3rem;
      font-weight: bold;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .tagline {
      font-size: 1.2rem;
      font-weight: 300;
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .description {
      font-size: 1rem;
      line-height: 1.6;
      opacity: 0.8;
      max-width: 500px;
      margin: 0 auto;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      min-width: 150px;
    }

    .btn-primary {
      background: linear-gradient(45deg, #ff6b6b, #ee5a24);
      border: none;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
    }

    .btn-outline-primary {
      border: 2px solid rgba(255, 255, 255, 0.8);
      color: white;
      background: transparent;
    }

    .btn-outline-primary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
      transform: translateY(-2px);
    }

    /* Animations */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.1); }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 0.1; }
      50% { transform: scale(1.5); opacity: 0.3; }
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .welcome-card {
        padding: 2rem;
        margin: 1rem;
      }

      .logo h1 {
        font-size: 2rem;
      }

      .logo i {
        font-size: 2rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
        max-width: 250px;
      }
    }
  `]
})
export class WelcomeComponent {
  constructor(private router: Router) {}
}
