import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {CoursDocument} from "../models/course";



@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/crackit/v1/student';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No access token found');
      return new HttpHeaders(); // Return headers with no token
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,
      'Content-Type': 'application/json'
    });
  }





  getCourses(): Observable<{ courseName: string }[]> {
    return this.http.get<{ courseName: string }[]>(`${this.baseUrl}/all_courses`);
  }







  getCourseDetails(courseName: string): Observable<CoursDocument> {
    return this.http.get<CoursDocument>(`${this.baseUrl}/course_details?courseName=${courseName}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des détails du cours:', error);
        // Renvoie un objet vide ou une valeur par défaut si vous souhaitez éviter des erreurs dans le composant
        return of({ id: '', courseName: '', chapters: [] });
      })
    );
  }




  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get<Blob>(`${this.baseUrl}/download/${fileId}`, { headers: this.getAuthHeaders(), responseType: 'blob' as 'json' })
      .pipe(
        catchError(this.handleError<Blob>('downloadFile'))
      );
  }

  viewFile(fileId: string): Observable<Blob> {
    return this.http.get<Blob>(`${this.baseUrl}/view/${fileId}`, { headers: this.getAuthHeaders(), responseType: 'blob' as 'json' })
      .pipe(
        catchError(this.handleError<Blob>('viewFile'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      alert(`${operation} failed. Please try again later.`);
      return of(result as T);
    };
  }

  getPptUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}/ppt`;
  }
}
