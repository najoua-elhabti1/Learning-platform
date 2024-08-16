import { Component, OnInit } from '@angular/core';
import { StudentActivity, StudentActivityService } from '../../services/StudentActivites.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../header/header.component";
import { ProfMenuComponent } from "../prof-menu/prof-menu.component";
import { catchError, map, of, Subscription } from 'rxjs';
import { ProfService } from '../../services/prof.service';

@Component({
  selector: 'app-course-activities',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, ProfMenuComponent],
  templateUrl: './course-activities.component.html',
  styleUrls: ['./course-activities.component.css']
})
export class CourseActivitiesComponent implements OnInit {
  activities: StudentActivity[] = [];
  filteredActivities: StudentActivity[] = [];
  courses: string[] = [];  // Changed from Observable to array
  selectedCourse: string = '';
  coursesSubscription!: Subscription;

  constructor(private studentActivityService: StudentActivityService, private profService: ProfService) {}

  ngOnInit(): void {
    // Fetch all activities
    this.studentActivityService.getAllActivities().subscribe((activities) => {
      this.activities = activities;
      this.filterActivities(); // Initialize the filtered list
    });

    // Fetch all courses and subscribe to the Observable
    this.coursesSubscription = this.profService.getChapters().pipe(
      map(courses => {
        this.courses = courses;
        console.log('Fetched courses:', courses);
        return courses.map(course => course);
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des cours:', error);
        return of([]);
      })
    ).subscribe((courses: string[]) => {
      this.courses = courses;
      console.log('Courses populated:', this.courses);
    });
  }

  filterActivities(): void {
    if (this.selectedCourse) {
      this.filteredActivities = this.activities.filter(activity => activity.courseId === this.selectedCourse);
    } else {
      this.filteredActivities = this.activities; // Show all activities if no course is selected
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from the courses observable to avoid memory leaks
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }
}
