/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoursDocument, FileClass } from "../models/course";
import { jwtDecode } from "jwt-decode";

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
      'Authorization': `Bearer ${token}`, // Assurez-vous que vous n'avez pas de `JSON.parse()` ici
      'Content-Type': 'application/json'
    });
  }

  // student.service.ts
  getCourses(): Observable<{ courseName: string }[]> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('Token not found');
      return throwError('Token not found');
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const username = decodedToken.sub;

      console.log('Extracted username from token:', username);

      // Effectuer la requête sans en-tête d'authentification
      return this.http.get<{ courseName: string }[]>(`${this.baseUrl}/all_courses`, {
        params: { username }
        // Note: Nous avons supprimé les en-têtes d'authentification ici
      }).pipe(
        catchError(this.handleError<{ courseName: string }[]>('getCourses', []))
      );
    } catch (error) {
      console.error('Error decoding token:', error);
      return throwError('Error decoding token');
    }
  }





  getCourseDetails(courseName: string): Observable<CoursDocument> {
    return this.http.get<CoursDocument>(`${this.baseUrl}/course_details?courseName=${courseName}`, {

    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des détails du cours:', error);

        return of({ id: '', courseName: '', chapters: [] });
      })
    );
  }
  getChapterQuestions(courseName: string, chapterName: string): Observable<FileClass> {
    return this.http.get<FileClass>(`${this.baseUrl}/chapter_questions?courseName=${courseName}&chapterName=${chapterName}`, {

    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des détails du cours:', error);

        return of();
      })
    );
  }

  downloadFile(courseName: string, fileId: string): Observable<Blob> {
    const token = localStorage.getItem('access_token');
  if (token) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,
      'Content-Type': 'application/json',
      'Accept': 'application/octet-stream',

    });
    return this.http.get<Blob>(`${this.baseUrl}/download/${courseName}/${fileId}`, {
      headers,
      responseType: 'blob' as 'json'
    }).pipe(
      catchError(this.handleError<Blob>('downloadFile'))
    );}else {
      console.log('No access token found');
      return of();
    }
  }

  viewFile(fileId: string): Observable<Blob> {
    return this.http.get<Blob>(`${this.baseUrl}/ppt/${fileId}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob' as 'json'
    }).pipe(
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
}
