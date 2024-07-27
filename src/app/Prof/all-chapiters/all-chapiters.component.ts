import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, FileDocument } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-chapiters',
  standalone: true,
  imports: [HeaderComponent,ProfMenuComponent,FormsModule,CommonModule],
  templateUrl: './all-chapiters.component.html',
  styleUrl: './all-chapiters.component.css'
})
export class AllChapitersComponent implements OnInit {
  courses: FileDocument[] = [];
  authService = inject(AuthService);
  router = inject(Router);
  isVisibleToStudents: boolean = false;


  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.authService.getAllCourses().subscribe(
      data => {
        this.courses = data;
        console.log(data);
      },
      error => {
        console.error('Error loading courses', error);
      }
    );
  }

  makeVisibleToStudents(courseId: string, isVisible: boolean): void {
    console.log(isVisible);
    this.authService.updateVisibility(courseId, isVisible).subscribe(
      (response) => {
        console.log(`Visibility updated for course ${courseId}`, response);
        this.loadCourses(); // Reload courses to update the visibility status
      },
      (error) => {
        console.error(`Error updating visibility for course ${courseId}`, error);
      }
    );
  }
  downloadCourse(courseId: string, fileName: string) {
   

      this.authService.downloadCourse(courseId,fileName).subscribe(
        (response: Blob) => {
          const url = window.URL.createObjectURL(response);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error => {
          console.error('Error downloading the file:', error);
        }
      );
   
  }
}
