import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-chapiter',
  standalone: true,

  imports: [FormsModule,CommonModule],

  templateUrl: './viewChapiter.component.html',
})
export class ViewPptComponent implements OnInit {
    fileUrl: string = "";
    safeFileUrl!: SafeResourceUrl;
    constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}
  
    ngOnInit(): void {
        const fileId = this.route.snapshot.paramMap.get('id');
        this.fileUrl = `http://localhost:8080/crackit/v1/student/view/${fileId}`;
        this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/viewer?url=${this.fileUrl}&embedded=true`);
      }
    
  
    
  }
