import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../services/student.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoursDocument } from '../models/course';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { HeaderComponent } from '../header/header.component';
import { StudentActivity, StudentActivityService } from '../services/StudentActivites.service';
import { AuthService } from '../services/auth/auth.service';

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
          <button class="btn btn-primary" (click)="downloadFile(this.courseName,chapter.id,chapter.chapter)">Download File</button>
          <button class="btn btn-primary" (click)="viewPpt(this.courseName, chapter.id,chapter.chapter)">View PPT</button>
            <button class="btn btn-primary" (click)="viewQuestions(this.courseName,chapter.chapter)">View Questions</button>
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
courseName!: string;
courseId!: string;
  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private studentActivityService: StudentActivityService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseName = params.get('courseName');
      if(courseName){      this.courseName=courseName;
      }
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
            this.courseId = course.id;
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

  viewQuestions(courseName: string, chapterName: string) {
    this.router.navigate(['student/static-question-form', courseName,chapterName]);
  }

  downloadFile(courseName: string, fileId: string, fileName: string) {
    this.studentService.downloadFile(courseName,fileId).subscribe((response: Blob) => {
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
      const user = localStorage.getItem('connectedUser');
      if(user){
        console.log(JSON.parse(user));
        const connectedUser = JSON.parse(user);
        const activity: StudentActivity = {
          studentId: connectedUser.firstName +" "+ connectedUser.lastName,
          courseId: fileName,
          actionType: 'DOWNLOAD',
          timestamp: new Date().toISOString(),
          duration: 0
          // clickCount: 0
      };
      this.studentActivityService.logActivity(activity).subscribe();

      }
      

      
  }

  viewPpt(courseName: string,id: string, chapterName: string): void {
    localStorage.setItem("chapterName",chapterName);
    this.router.navigate([`/courses/${courseName}/${id}/ppt`]);
  }
}
