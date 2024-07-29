import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StudentService } from '../services/student.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  template: `
    <app-header></app-header>
    <div class="container">
      <table class="table" *ngIf="chapter">
        <thead>
          <tr>
            <th>Title</th>
            <th>Objective</th>
            <th>Plan</th>
            <th>Introduction</th>
            <th>Conclusion</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ chapter.chapter }}</td>
            <td>{{ chapter.objectifs }}</td>
            <td>{{ chapter.plan }}</td>
            <td>{{ chapter.introduction }}</td>
            <td>{{ chapter.conclusion }}</td>
            <td>
              <button
                class="btn btn-primary"
                [routerLink]="['/static-question-form', chapter.chapter]">
                View Questions
              </button>
              <button (click)="downloadFile(chapter.id)">Download File</button>
              <button (click)="viewChapter(chapter.id)">View File</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div *ngIf="fileUrl" class="iframe-container">
  <iframe [src]="fileUrl" width="100%" height="600px" frameborder="0"></iframe>
</div>
  `,
  styles: [`
    .container {
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .table {
      width: 100%;
      max-width: 800px;
      border-collapse: collapse;
    }

    .table th, .table td {
      border: 1px solid #dee2e6;
      padding: 8px;
      text-align: left;
    }

    .table th {
      background-color: #f8f9fa;
    }

    .btn-primary {
      background-color: rgba(253, 173, 2, 1);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s, box-shadow 0.3s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-primary:hover {
      background-color: rgba(253, 173, 2, 1);
    }

    .btn-primary:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(253, 173, 2, 1);
    }

    .btn-primary:active {
      background-color: rgba(253, 173, 2, 1);
    }
  `]
})
export class ChapterDetailComponent implements OnInit {
  chapter: any;
  public fileUrl: SafeResourceUrl | undefined;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const chapterName = params['chapterName'];
      this.studentService.getChapterDetails(chapterName).subscribe(
        data =>{ this.chapter = data;console.log(data);},
        error => console.error('Error fetching chapter details', error)
      );
    });
  }
  downloadFile(fileId: string) {
    this.studentService.downloadFile(fileId).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.chapter.chapter+'.pptx'; 
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  // viewFile(fileId: string) {
  //   const fileUrl = this.studentService.getFileUrl(fileId);
  //   const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  //   this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(officeViewerUrl);
  //   console.log(fileUrl);

  // }
  viewChapter(fileId: string) {
    window.open(`/view-ppt/${fileId}`, '_blank');
  }
}
