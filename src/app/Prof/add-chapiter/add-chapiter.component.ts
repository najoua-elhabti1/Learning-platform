import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-add-chapiter',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, ProfMenuComponent, FooterComponent],
  templateUrl: './add-chapiter.component.html',
  styleUrl: './add-chapiter.component.css'
})
export class AddChapiterComponent {
  uploadStatus: string = '';
  courses = ['Course 1', 'Course 2', 'Course 3'];
  chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3'];
  selectedCourse: string = this.courses[0];
  selectedChapter: string = this.chapters[0];
  selectedFile: File | null = null;
  authService = inject(AuthService);
  isVisible: boolean = false;


  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  onSubmit() { 
    console.log(this.isVisible);
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    } 
    this.authService.uploadChapter(this.selectedFile,this.selectedChapter,this.selectedCourse,this.isVisible).subscribe(
      response => {
        console.log('File uploaded successfully!', response);
        this.uploadStatus = 'Fichier téléchargé avec succès !';
      },
      error => {
        console.error('Error uploading file:', error);
        if (error.status === 401) {
          this.uploadStatus = 'Non autorisé. Veuillez vous reconnecter.';
        } else {
          this.uploadStatus = `${error.status} Échec du téléchargement du fichier.`;
        }
      }
    );
  }

  
}
