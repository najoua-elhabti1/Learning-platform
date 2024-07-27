import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
authService = inject(AuthService);
router = inject(Router);
  onLogout(): void {
    this.authService.logout().subscribe(
      () => {
        localStorage.removeItem('connectedUser');
    localStorage.removeItem('access_token');
    this.router.navigateByUrl('login');
        console.log('Logged out successfully');
      },
      error => {
        // Handle error if any
        console.error('Error logging out:', error);
      }
    );
  }
}
