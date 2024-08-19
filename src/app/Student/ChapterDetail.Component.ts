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
import { StudentMenuComponent } from './student-menu/student-menu.component';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  template: `
    <app-header></app-header>
    <app-student-menu></app-student-menu>
    <div class="container mx-auto p-4 wrapper ">
      <h2 class="text-2xl font-bold mb-4">Détails du cours</h2>
      <div *ngIf="errorMessage" class="error text-red-500 text-center mb-4">
        {{ errorMessage }}
      </div>
      <div class="py-2 mt-8 -my-2 overflow-x-auto">
        <div class="inline-block min-w-full align-middle">
          <div class="mx-auto overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-x-auto">
              <thead class="bg-customBlue text-white">
                <tr>
                  <th class="px-4 py-2 text-left">Chapitre</th>
                  <th class="px-4 py-2 text-left">Objectif</th>
                  <th class="px-4 py-2 text-left">Plan</th>
                  <th class="px-4 py-2 text-left">Introduction</th>
                  <th class="px-4 py-2 text-left">Conclusion</th>
                  <th class="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let chapter of filteredChapters" class="border-t border-gray-200 hover:bg-gray-100">
                  <td class="px-4 py-2">{{ chapter.chapter }}</td>
                  <td class="px-4 py-2">{{ chapter.objectifs }}</td>
                  <td class="px-4 py-2">{{ chapter.plan }}</td>
                  <td class="px-4 py-2">{{ chapter.introduction }}</td>
                  <td class="px-4 py-2">{{ chapter.conclusion }}</td>
                  <td class="px-4 py-2 flex space-x-2">
                    <button class="btn btn-primary" (click)="downloadFile(courseName, chapter.id, chapter.chapter)">Télécharger chapitre</button>
                    <button class="btn btn-primary" (click)="viewPpt(courseName, chapter.id, chapter.chapter)">Voir PPT</button>
                    <button class="btn btn-primary" (click)="viewQuestions(courseName, chapter.chapter)">Voir Questions</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="filteredChapters.length === 0" class="text-center text-gray-500 mt-4">
              Aucun chapitre visible trouvé.
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  imports: [
    CommonModule,
    StudentComponent,
    HeaderComponent,
    StudentMenuComponent,
    FooterComponent
],
  styles: [`
  .wrapper {
      min-height: 65vh;
     
    }
    /* Global styles for the table */
    .container {
      @apply p-4;
    }

    .table {
      @apply min-w-full bg-white border border-gray-200 rounded-lg shadow-md;
    }

    .table th, .table td {
      @apply px-4 py-2 text-left border border-gray-200;
    }

    .table th {
      @apply bg-customBlue text-white;
    }

    .table tr:nth-child(even) {
      @apply bg-gray-50;
    }

    .table tr:hover {
      @apply bg-gray-100;
    }

    .btn-primary {
      @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300;
    }

    .error {
      @apply text-red-500 text-center;
    }
  `]
})
export class ChapterDetailComponent implements OnInit {
  course$: Observable<CoursDocument> = of({ id: '', courseName: '', chapters: [] });
  filteredChapters: any[] = [];
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
      if (courseName) {
        this.courseName = courseName;
        console.log('Paramètre courseName récupéré:', courseName);

        this.studentService.getCourseDetails(courseName).pipe(
          catchError(error => {
            console.error('Erreur lors de la récupération des détails du cours:', error);
            this.errorMessage = "Erreur lors de la récupération des détails du cours.";
            return of({ id: '', courseName: '', chapters: [] });
          }),
          map(course => {
            this.courseId = course.id;
            console.log('Chapitres avant filtrage:', course.chapters);
            const filteredChapters = course.chapters.filter(chapter => chapter.visible);
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
    this.router.navigate(['student/static-question-form', courseName, chapterName]);
  }

  downloadFile(courseName: string, fileId: string, fileName: string) {
    this.studentService.downloadFile(courseName, fileId).subscribe((response: Blob) => {
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
    if (user) {
      console.log(JSON.parse(user));
      const connectedUser = JSON.parse(user);
      const activity: StudentActivity = {
        studentId: `${connectedUser.firstName} ${connectedUser.lastName}`,
        courseId: fileName,
        actionType: 'DOWNLOAD',
        timestamp: new Date().toISOString(),
        duration: 0
      };
      this.studentActivityService.logActivity(activity).subscribe();
    }
  }

  viewPpt(courseName: string, id: string, chapterName: string): void {
    localStorage.setItem("chapterName", chapterName);
    this.router.navigate([`/courses/${courseName}/${id}/ppt`]);
  }
}
