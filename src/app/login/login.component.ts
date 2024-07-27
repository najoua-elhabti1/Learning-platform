import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteConfigLoadEnd, Router } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { Console } from 'console';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule, FooterComponent],
  templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginObj :any = {
  'email' : "",
  'password' : ''
}
errorMessage: string = '';
authService = inject(AuthService);
router = inject(Router);
onLogin(){
  this.authService.login(this.loginObj).subscribe((res:any)=>{
    console.log(res.access_token);
    if(res.access_token){
      
      localStorage.setItem('access_token',JSON.stringify(res.access_token));
      this.authService.getUserInfo(res.access_token).subscribe(
        data => {
          console.log('User information:', data);
          localStorage.setItem('connectedUser', JSON.stringify(data));
          // localStorage.setItem('email', data.email);

  console.log(res.role);
  console.log(JSON.stringify(data).match('email'));
          const role = res.role; 
          if (role === 'ADMIN') {
            console.log("i am here");
            this.router.navigateByUrl('Admin/upload-list');
          } else if (role === 'Prof') {
            this.router.navigate(['/Prof/Dashboard']);
          }else if (role === 'Student') {
            console.log(res);
            console.log(res.needsPasswordChange);
            if (res.needsPasswordChange) {
              this.router.navigate(['/Student/ChangePwd']);
            }else{
            this.router.navigate(['/student']);
          }
          }else{
            
            this.router.navigate(['/Admin/upload-list']);
          }
        },
        error => {
          console.error('Error:', this.errorMessage);
        }
      );
      // this.router.navigateByUrl('dashboard');

    }else{
      alert(res.message);
    }
  },
  error => {
    if (error.status === 401) {
      this.errorMessage = 'Identifiants invalides.';
      console.log(this.errorMessage);

    } else {
      this.errorMessage = 'Login failed. Please try again later.';
    }
    console.error('Error:', this.errorMessage);
  });
}
navigateToResetPassword(){
  this.router.navigateByUrl('request-reset');

}
  // constructor(private authService: AuthService) { }

//   onSubmit(): void {
//     this.authService.login(this.email, this.password).subscribe(response => {
//       console.log('Login successful:', response);
//       // Handle successful login, e.g., redirect to dashboard
//     }, error => {
//       console.error('Login error:', error);
//       // Handle login error
//     });
//   }
}
