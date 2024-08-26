/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StudentService } from '../services/student.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StudentComponent } from "./student.component";
import { StudentMenuComponent } from "./student-menu/student-menu.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-chapters',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StudentComponent, StudentMenuComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <app-student-menu></app-student-menu>
    <div class="learning-container">
      <h1>Learning by Doing</h1>
    </div>
    <div class="chapters-container">
    <a *ngFor="let cours of courses$ | async" 
   class="chapter-card" 
   (click)="viewChapterDetails(cours.courseName)" 
   (keydown)="onKeydown($event, cours.courseName)" 
   tabindex="0">
  {{ cours.courseName }}
</a>

    </div>
    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .learning-container {
      background: linear-gradient(135deg, #004494 0%, #0056b3 100%);
      color: white;
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      margin: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .learning-container h1 {
      font-size: 2.5rem;
      letter-spacing: 1px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .chapters-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
      margin-top: 100px;
      min-height: 400px;
    }

    .chapter-card {
      background-color: white;
      border: 1px solid #0056b3;
      padding: 15px;
      border-radius: 10px; /* Rounded corners for a modern look */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Slightly larger shadow for depth */
      text-align: center;
      width: 100%;
      max-width: 500px;
      color: #333; /* Slightly darker text for contrast */
      font-size: 1.2rem; /* Larger font size for readability */
      transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth hover transition */
    }

    .chapter-card:hover {
      background-color: #004494;
      color: white;
      cursor: pointer;
      transform: translateY(-5px) scale(1.02); /* Slight lift and scale effect */
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Enhanced shadow on hover */
    }

    .error-message {
      color: red;
      text-align: center;
      margin-top: 20px;
    }
  `]
})
export class ChaptersComponent implements OnInit {
  courses$: Observable<any[]> = of([]); 
  errorMessage: string | null = null; 

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.courses$ = this.studentService.getCourses().pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des cours:', error);
        this.errorMessage = "Erreur lors de la récupération des cours.";
        return of([]);
      })
    );
  }

  viewChapterDetails(courseName: string): void {
    this.router.navigate(['student/chapter-detail', courseName]);
  }
  onKeydown(event: KeyboardEvent, courseName: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.viewChapterDetails(courseName);
    }
  }
  
}
