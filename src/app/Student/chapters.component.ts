import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StudentService } from '../services/student.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {StudentComponent} from "./student.component";

@Component({
  selector: 'app-chapters',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StudentComponent],
  template: `
    <app-student></app-student>
    <div class="chapters-container">
      <a *ngFor="let cours of courses$ | async" class="chapter-card" (click)="viewChapterDetails(cours.courseName)">
        {{ cours.courseName }}
      </a>
    </div>
    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  `,
  styles: [`
    .chapters-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 20px;
      margin-top: 20px; /* Ajout de l'espace en haut */
      background-size: cover;
    }

    .chapter-card {
      background-color: #0056b3;
      border: 1px solid #0056b3;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
      width: 100%;
      max-width: 600px;
      text-decoration: none;
      color: white; /* Couleur du texte en blanc pour le contraste avec le bleu */
    }

    .chapter-card:hover {
      background-color: #004494; /* Changement de couleur au survol pour une meilleure visibilité */
      cursor: pointer;
    }

    .error-message {
      color: red;
      text-align: center;
      margin-top: 20px;
    }
  `]
})
export class ChaptersComponent implements OnInit {
  courses$: Observable<any[]> = of([]); // Initialisation correcte de l'observable
  errorMessage: string | null = null; // Pour afficher les erreurs

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.courses$ = this.studentService.getCourses().pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des cours:', error);
        this.errorMessage = "Erreur lors de la récupération des cours.";
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    );

    // Debug: Vérification des données récupérées
    this.courses$.subscribe(courses => {

    });
  }

  viewChapterDetails(courseName: string): void {
    this.router.navigate(['student/chapter-detail', courseName]);
  }
}
