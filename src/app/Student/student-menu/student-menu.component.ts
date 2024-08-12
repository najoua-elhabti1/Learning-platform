import { Component } from '@angular/core';
import { HeaderComponent } from "../../header/header.component";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-student-menu',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './student-menu.component.html',
  styleUrl: './student-menu.component.css'
})
export class StudentMenuComponent {
  constructor(private router: Router, private authService: AuthService) {
  } 
  toggleQuestionMenu() {
    const menu = document.getElementById('question-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  showChapter() {
    this.router.navigate(['student/chapters']);
  }

  navigateToChangePwd() {
    this.router.navigate(['/student/ChangePwd']);
  }

  onLogout(): void {
    this.authService.logout().subscribe(
      () => {
        localStorage.removeItem('connectedUser');
        localStorage.removeItem('access_token');
        this.router.navigateByUrl('login');
        console.log('Logged out successfully');
      },

    );
  }
}
