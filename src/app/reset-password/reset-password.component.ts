import { Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [HeaderComponent,FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
  password: string = '';
  confirmPassword: string = '';
  resetStatus: string = '';
  error: string = '';
  token: string | null = ''; // This will hold the reset token
  authService = inject(AuthService);
  router = inject(Router);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
      if (this.token) {
        this.authService.isTokenExpired(this.token).subscribe(
          (isExpired) => {
            console.log(`Token expired: ${isExpired}, Type: ${typeof isExpired}`);
            if (isExpired === 'true') {
              this.error = 'Reset token is expired.';
              console.log(this.error);
              this.router.navigate(['/request-reset'], { queryParams: { error: this.error } });
            } else if (isExpired === 'false') {
              console.log("Token is valid. Proceed with the next steps.");
            } else {
              console.log("Unexpected token expiration status.");
            }
          },
          (error) => {
            console.error('Error checking token expiration:', error);
            this.error = 'Error checking token expiration.';
            this.router.navigate(['/request-reset'], { queryParams: { error: this.error } });   
          }
        );
      } else {
        this.error = 'Reset token is missing.';
        this.router.navigate(['/request-reset'], { queryParams: { error: this.error } });   
      }
    }
  }

  handlePasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password = input.value;
  }

  handleConfirmPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.confirmPassword = input.value;
  }

  handleSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.resetStatus = 'Passwords do not match.';
      return;
    }

    this.error = '';
    if (this.token) {
      this.authService.resetPassword(this.password, this.token).subscribe(
        response => {
          this.resetStatus = 'Password reset successfully.';
          setTimeout(() => this.router.navigate(['/login']), 2000); 
        },
        error => {
          console.error('Failed to reset password:', error);
          this.resetStatus = 'Failed to reset password. Please try again later.';
        }
      );
    } else {
      this.error = 'Reset token is missing.';
    }
  }
  navigateToLogin(){
    this.router.navigateByUrl('login');
  
  }
}
