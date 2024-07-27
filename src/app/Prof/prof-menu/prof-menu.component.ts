import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prof-menu',
  standalone: true,
  imports: [],
  templateUrl: './prof-menu.component.html',
  styleUrl: './prof-menu.component.css'
})
export class ProfMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);
   toggleUserMenu() {
    var userMenu = document.getElementById("user-menu");
    if (userMenu){
    userMenu.classList.toggle("hidden");
  }
}
toggleCourseMenu(){
  var userMenu = document.getElementById("course-menu");
  if (userMenu){
  userMenu.classList.toggle("hidden");
}
}
toggleQuestionMenu(){
  var userMenu = document.getElementById("question-menu");
  if (userMenu){
  userMenu.classList.toggle("hidden");
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
          // Handle error if any
          console.error('Error logging out:', error);
        }
      );
    }
    navigateToAddChapter(){
      this.router.navigateByUrl('Prof/AddChapiter');
    
    }
    navigateToAddQuestion(){
      this.router.navigateByUrl('Prof/AddQuestion');
    
    }
    navigateToAllQuestions(){
      this.router.navigateByUrl('Prof/AllQuestions');

    }
    navigateToListAll(){
      this.router.navigateByUrl('Prof/AllChapiters');
    }
}
