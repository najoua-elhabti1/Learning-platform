import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from "./auth/auth.service";


@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.role === 'Student') {

      return true;
    } else {
      // Redirige vers une page non autorisée ou gère l'accès d'une autre manière
      this.router.navigate(['/Login']); // Exemple de redirection vers une page d'autorisation refusée
      return false;
    }
  }
}
