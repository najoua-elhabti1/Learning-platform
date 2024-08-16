import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentActivity {
    studentId: string;
    courseId: string;
    actionType: string;
    timestamp: string;
    duration: number;
    // clickCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentActivityService {
    private baseUrl = 'http://localhost:8080/crackit/v1/prof/student-activities';

    constructor(private http: HttpClient) {}

    logActivity(activity: StudentActivity): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/log`, activity);
    }

    getActivitiesByCourse(courseId: string): Observable<StudentActivity[]> {
        return this.http.get<StudentActivity[]>(`${this.baseUrl}/course/${courseId}`);
    }

    getActivitiesByStudent(studentId: string): Observable<StudentActivity[]> {
        return this.http.get<StudentActivity[]>(`${this.baseUrl}/student/${studentId}`);
    }
    getAllActivities(): Observable<StudentActivity[]> {
        return this.http.get<StudentActivity[]>(`${this.baseUrl}/all`);
    }
}
