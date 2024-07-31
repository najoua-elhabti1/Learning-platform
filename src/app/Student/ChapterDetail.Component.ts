import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StudentService } from '../services/student.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StudentComponent } from "./student.component";

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink, StudentComponent],
  template: `
    <app-student></app-student>
    <div class="container">
      <table class="table" *ngIf="chapter">
        <thead>
        <tr class="bg-customBlue">
          <th>Title</th>
          <th>Objective</th>
          <th>Plan</th>
          <th>Introduction</th>
          <th>Conclusion</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{{ chapter.chapter }}</td>
          <td>{{ chapter.objectifs }}</td>
          <td>{{ chapter.plan }}</td>
          <td>{{ chapter.introduction }}</td>
          <td>{{ chapter.conclusion }}</td>
          <td class="action-buttons">
            <button class="btn btn-primary" (click)="viewQuestions(chapter.chapter)">
              View Questions
            </button>
            <button class="btn btn-primary" (click)="downloadFile(chapter._id)">Download File</button>
            <button class="btn btn-primary" (click)="viewPpt(chapter._id)">View PPT</button>
          </td>
        </tr>
        </tbody>
      </table>
      <iframe *ngIf="pptUrl" [src]="pptUrl" width="100%" height="600px"></iframe>
    </div>
<<<<<<< HEAD
=======
    


>>>>>>> 313d4558fea9494ab0c686c256c50aa141e653fb
  `,
  styles: [`
    .container {
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .table {
      width: 100%;
      max-width: 1000px;
      border-collapse: collapse;
      background-color: #ffffff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .table th, .table td {
      border: 1px solid #dee2e6;
      padding: 12px;
      text-align: left;
      vertical-align: middle;
    }

    .bg-customBlue {
      background-color: #0056b3;
      color: white;
      text-transform: uppercase;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .btn-primary {
      background-color: rgba(253, 173, 2, 1);
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s, box-shadow 0.3s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-primary:hover {
      background-color: rgba(253, 173, 2, 0.8);
    }

    .btn-primary:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(253, 173, 2, 0.4);
    }

    .btn-primary:active {
      background-color: rgba(253, 173, 2, 0.6);
    }
  `]
})
export class ChapterDetailComponent implements OnInit {

  pptUrl: SafeResourceUrl | undefined;
  chapter: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const chapterName = params['chapterName'];
      if (chapterName) {
        this.loadChapterDetails(chapterName);
      }
    });
  }

  loadChapterDetails(chapterName: string): void {
    this.studentService.getChapterDetails(chapterName).subscribe(
      data => {
        this.chapter = data;
        console.log(data);
      },
      error => console.error('Error fetching chapter details', error)
    );
  }

  viewQuestions(chapterName: string) {
    this.router.navigate(['student/static-question-form', chapterName]);
  }

  downloadFile(fileId: string) {
    this.studentService.downloadFile(fileId).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.chapter.chapter + '.pptx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }
<<<<<<< HEAD

=======
>>>>>>> 313d4558fea9494ab0c686c256c50aa141e653fb
  viewPpt(fileId: string): void {
    this.router.navigate([`student/courses/${fileId}/ppt`]);
  }
}
