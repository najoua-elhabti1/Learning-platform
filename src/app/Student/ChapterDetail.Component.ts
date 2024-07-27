import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StudentService } from '../services/student.service';

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
            <th>Visibility</th>
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
            <td>{{ chapter.isVisible }}</td>
            <td>
              <button
                class="btn btn-primary"
                [routerLink]="['/static-question-form', chapter.chapter]">
                View Questions
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const chapterName = params['chapterName'];
      this.studentService.getChapterDetails(chapterName).subscribe(
        data => this.chapter = data,
        error => console.error('Error fetching chapter details', error)
      );
    });
  }
}
