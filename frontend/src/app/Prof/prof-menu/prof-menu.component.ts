import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prof-menu',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './prof-menu.component.html',
  styleUrls: ['./prof-menu.component.css'] // Corrected from 'styleUrl' to 'styleUrls'
})
export class ProfMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);

  questionMenuOpen = false;
  courseMenuOpen = false;
  userMenuOpen = false;
  mobileMenuOpen = false;

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    this.closeOtherMenus('user');
  }

  toggleCourseMenu() {
    this.courseMenuOpen = !this.courseMenuOpen;
    this.closeOtherMenus('course');
  }
toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  toggleQuestionMenu() {
    this.questionMenuOpen = !this.questionMenuOpen;
    this.closeOtherMenus('question');
  }

  closeOtherMenus(currentMenu: string) {
    if (currentMenu !== 'user') {
      this.userMenuOpen = false;
    }
    if (currentMenu !== 'course') {
      this.courseMenuOpen = false;
    }
    if (currentMenu !== 'question') {
      this.questionMenuOpen = false;
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe(
      () => {
        localStorage.removeItem('connectedUser');
        localStorage.removeItem('access_token');
        this.router.navigateByUrl('login');
        console.log('Logged out successfully');
      },
      error => {
        console.error('Error logging out:', error);
      }
    );
  }

  navigateToAddChapter() {
    this.router.navigateByUrl('Prof/AddChapiter');
  }

  navigateToAddCourse() {
    this.router.navigateByUrl('Prof/AddCourse');
  }

  navigateToAddQuestion() {
    this.router.navigateByUrl('Prof/AddQuestion');
  }

  navigateToAllQuestions() {
    this.router.navigateByUrl('Prof/AllQuestions');
  }

  navigateToListAll() {
    this.router.navigateByUrl('Prof/AllChapiters');
  }

  navigateToModifyPwd() {
    this.router.navigateByUrl('Prof/ChangePwd');
  }

  navigateToStudentActivities() {
    this.router.navigateByUrl('Prof/StudentActivities');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.relative')) {
      this.questionMenuOpen = false;
      this.courseMenuOpen = false;
      this.userMenuOpen = false;
    }
  }
}
