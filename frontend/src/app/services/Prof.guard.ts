import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.role === 'Prof') {
      return true;
    } else {
      this.router.navigate(['/Login']);
      return false;
    }
  }
}