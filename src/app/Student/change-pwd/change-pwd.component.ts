import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../header/header.component";
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-change-pwd',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './change-pwd.component.html',
  styleUrl: './change-pwd.component.css'
})
export class ChangePwdComponent {
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Nouveau mot de passe et la confirmation sont differents.';
      return;
    }

    const email = this.authService.currentUser().email;
    console.log(email);
    if (!email) {
      this.errorMessage = 'User is not logged in.';
      return;
    }

    this.authService.changePassword(email, this.oldPassword, this.newPassword,this.confirmPassword).subscribe(
      response => {
        this.router.navigate(['/login']);
      },
      error => {
        console.log(error);
        if (error.status === 400) {
          this.errorMessage = 'L\'ancien mot de passe ne correspond pas.';
          // console.log(this.errorMessage);
    
        }
        
        else{
        this.errorMessage = 'Failed to change password. Please try again later.';
      }
    }
    );
  }
}
