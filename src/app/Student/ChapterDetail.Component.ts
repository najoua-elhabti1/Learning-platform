import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../services/student.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoursDocument } from '../models/course';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { HeaderComponent } from '../header/header.component';

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

      <table class="table" *ngIf="filteredChapters.length > 0">
        <thead>
        <tr class="bg-customBlue">
          <th>Chapitre</th>
          <th>Objectif</th>
          <th>Plan</th>
          <th>Introduction</th>
          <th>Conclusion</th>

          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let chapter of filteredChapters">
          <td>{{ chapter.chapter }}</td>
          <td>{{ chapter.objectifs }}</td>
          <td>{{ chapter.plan }}</td>
          <td>{{ chapter.introduction }}</td>
          <td>{{ chapter.conclusion }}</td>

          <td class="action-buttons">
            <button class="btn btn-primary" (click)="viewQuestions(chapter.chapter)">View Questions</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div *ngIf="filteredChapters.length === 0">
        Aucun chapitre visible trouvé.
      </div>
    </div>
  `,
  imports: [
    CommonModule,
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
      background-color: #0056b3;
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
  filteredChapters: any[] = []; // Tableau local pour stocker les chapitres filtrés
  errorMessage: string | null = null;

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseName = params.get('courseName');
      console.log('Paramètre courseName récupéré:', courseName);

      if (courseName) {
        console.log('Appel de getCourseDetails avec courseName:', courseName);

        this.studentService.getCourseDetails(courseName).pipe(
          catchError(error => {
            console.error('Erreur lors de la récupération des détails du cours:', error);
            this.errorMessage = "Erreur lors de la récupération des détails du cours.";
            return of({ id: '', courseName: '', chapters: [] });
          }),
          map(course => {
            console.log('Chapitres avant filtrage:', course.chapters);
            const filteredChapters = course.chapters.filter(chapter => chapter.visible === true);
            console.log('Chapitres filtrés:', filteredChapters);

            this.filteredChapters = filteredChapters;
            return course;
          })
        ).subscribe();
      } else {
        console.warn('courseName est nul ou vide');
      }
    });
  }

  viewQuestions(chapterName: string) {
    this.router.navigate(['student/static-question-form', chapterName]);
  }

  downloadFile(fileId: string, fileName: string) {
    this.studentService.downloadFile(fileId).subscribe((response: Blob) => {
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
      });
  }

  viewPpt(chapterName: string): void {
    this.router.navigate([`/courses/${chapterName}/ppt`]);
  }
}
