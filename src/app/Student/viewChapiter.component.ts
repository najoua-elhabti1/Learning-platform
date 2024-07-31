import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';

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
    private courseService: StudentService,
    private sanitizer: DomSanitizer
  ) { }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPdfFile(id);
    }
  }

  loadPdfFile(id: string): void {
    const pdfPath = `http://localhost:8080/crackit/v1/student/ppt/${id}/pdf`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
  }

    }



