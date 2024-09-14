import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';
import { HttpHeaders } from '@angular/common/http';
import { StudentActivity, StudentActivityService } from '../services/StudentActivites.service';

@Component({
  selector: 'app-view-chapiter',
  standalone: true,

  imports: [FormsModule,CommonModule],

  templateUrl: './viewChapiter.component.html',
})
export class ViewPptComponent implements OnInit , OnDestroy {
  pdfUrl: SafeResourceUrl | undefined;
  startTime: number = 0;
  clickCount: number = 0;
  chapterName !: string;
  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private sanitizer: DomSanitizer,
    private studentActivityService: StudentActivityService
  ) { }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const courseName = this.route.snapshot.paramMap.get('courseName');
    const chapterName = localStorage.getItem("chapterName");
    if(chapterName){
      this.chapterName = chapterName;
    }
    
    if (id && courseName) {
      this.loadPdfFile(courseName, id);
    }
    this.startTime = Date.now();
    // window.addEventListener('beforeunload', () => this.logActivity());
    // document.addEventListener('click', this.recordClick.bind(this));

  }

  loadPdfFile(courseName:string, id: string): void {
    const pdfPath = `http://localhost:8080/crackit/v1/student/ppt/${courseName}/${id}/pdf`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
  }

//   recordClick(): void {
//     this.clickCount++;
// }

logActivity(): void {
  console.log(document.visibilityState);
   
    console.log("here")
    const duration = Math.floor((Date.now() - this.startTime) / 1000); // Duration in seconds
    const user = localStorage.getItem('connectedUser');
    if(user){
      console.log(JSON.parse(user));
      const connectedUser = JSON.parse(user);
    const activity: StudentActivity = {
      studentId: connectedUser.firstName +" "+ connectedUser.lastName,
      courseId: this.chapterName,
        actionType: 'VIEW',
        timestamp: new Date().toISOString(),
        duration: duration,
        // clickCount: this.clickCount
    };

    this.studentActivityService.logActivity(activity).subscribe();
}
}
ngOnDestroy(): void {
  // Log activity when the user leaves the page (or component is destroyed)
  this.logActivity();
  localStorage.removeItem("chapterName");
  // Remove the event listener to prevent memory leaks
  // document.removeEventListener('click', this.recordClick.bind(this));
}
    }




