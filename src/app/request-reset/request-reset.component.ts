import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observer } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-request-reset',
  standalone: true,
  imports: [HeaderComponent,FormsModule, CommonModule],
  templateUrl: './request-reset.component.html',
  styleUrl: './request-reset.component.css'
})
export class RequestResetComponent implements OnInit {
  error: string = '';
  email: string = '';
  resetStatus: string = '';
  authService = inject(AuthService);
  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    
      this.route.queryParams.subscribe(params => {
        this.error = params['error'] || '';
      });
    
  }
  handlePasswordReset(): void {
    
    
    const observer: Observer<any> = {
      next: (response) => {
        console.log(response);
        const resetToken = response; 
        this.resetStatus = 'Password reset instructions have been sent to your email.';
        // setTimeout(() => this.router.navigate(['/reset-password'], { queryParams: { token: resetToken } }), 2000);
      },
      error: (error) => {
        console.error('Failed to request password reset:', error);
  console.log('Error status:', error.status);
  console.log('Error message:', error.message);
  console.log('Error body:', error.error); 
        console.error('Failed to request password reset:', error);
        if (error.status === 404) {
          this.resetStatus = 'No account found with that email.';
        } else {
          this.resetStatus = 'Failed to request password reset. Please try again later.';
        }
      },
      complete: () => {
        // Optional: Implement logic when observable completes, if needed
      }
    };
  
    // Subscribe using the observer
    this.authService.handlePasswordReset(this.email).subscribe(observer);
  }
  navigateToResetPassword(){
    this.email = '';
    this.resetStatus = '';
    this.router.navigateByUrl('request-reset');
  
  }
  navigateToLogin(){
    this.router.navigateByUrl('login');
  
  }
}
