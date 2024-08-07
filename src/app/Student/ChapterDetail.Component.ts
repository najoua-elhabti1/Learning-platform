import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../services/student.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoursDocument } from '../models/course';
import { AsyncPipe, CommonModule } from '@angular/common';
import {StudentComponent} from "./student.component";
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  template: `

    <app-student></app-student>
    <div class="container">
      <h2>Détails du cours</h2>

      <div *ngIf="errorMessage" class="error">
        {{ errorMessage }}
      </div>

      <table class="table" *ngIf="course$ | async as course">
        <thead>
        <tr class="bg-customBlue">
          <th>Chapitre</th>
          <th>Objectif</th>
          <th>Plan</th>
          <th>Introduction</th>
          <th>Conclusion</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let chapter of course.chapters">
          <td>{{ chapter.chapter }}</td>
          <td>{{ chapter.objectifs }}</td>
          <td>{{ chapter.plan }}</td>
          <td>{{ chapter.introduction }}</td>
          <td>{{ chapter.conclusion }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  imports: [
    CommonModule,
    AsyncPipe,
    StudentComponent,
    HeaderComponent
  ],
  styles: [`
    .container {
      padding: 20px;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th, .table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    .table th {
      background-color: #0056b3; /* Couleur personnalisée pour l'en-tête du tableau */
      color: white;
    }

    .table tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    .error {
      color: red;
      text-align: center;
      margin-top: 20px;
    }
  `]
})
export class ChapterDetailComponent implements OnInit {
  course$: Observable<CoursDocument> = of({ id: '', courseName: '', chapters: [] });
  errorMessage: string | null = null;

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseName = params.get('courseName');
      console.log('Paramètre courseName récupéré:', courseName);

      if (courseName) {
        console.log('Appel de getCourseDetails avec courseName:', courseName);

        this.course$ = this.studentService.getCourseDetails(courseName).pipe(
          catchError(error => {
            console.error('Erreur lors de la récupération des détails du cours:', error);
            this.errorMessage = "Erreur lors de la récupération des détails du cours.";
            return of({ id: '', courseName: '', chapters: [] });
          })
        );

        this.course$.subscribe(
          courseData => {
            console.log('Données du cours reçues:', courseData);
          },
          error => {
            console.error('Erreur lors de la souscription à course$:', error);
          }
        );
      } else {
        console.warn('courseName est nul ou vide');
      }
    });
  }
}
