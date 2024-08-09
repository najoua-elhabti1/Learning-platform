import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-view-chapiter',
  standalone: true,

  imports: [FormsModule,CommonModule],

  templateUrl: './viewChapiter.component.html',
})
export class ViewPptComponent implements OnInit {
  pdfUrl: SafeResourceUrl | undefined;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private sanitizer: DomSanitizer
  ) { }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const courseName = this.route.snapshot.paramMap.get('courseName');

    if (id && courseName) {
      this.loadPdfFile(courseName, id);
    }
  }

  loadPdfFile(courseName:string, id: string): void {
    const pdfPath = `http://localhost:8080/crackit/v1/student/ppt/${courseName}/${id}/pdf`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
  }

    }




