import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  getAllChapters(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/chapters`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError<string[]>('getAllChapters', []))
      );
  }

  getChapterDetails(chapterName: string): Observable<any> {
    const encodedName = encodeURIComponent(chapterName);
    return this.http.get<any>(`${this.baseUrl}/chapter/${encodedName}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError<any>('getChapterDetails'))
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
