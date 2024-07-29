import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/crackit/v1/student';

  constructor(private http: HttpClient) {}

  getAllChapters(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/chapters`);
  }

  getChapterDetails(chapterName: string): Observable<any> {
    const encodedName = encodeURIComponent(chapterName);
    return this.http.get<any>(`${this.baseUrl}/chapter/${encodedName}`);
  }
  downloadFile(fileId: string) {
    return this.http.get(`${this.baseUrl}/download/${fileId}`, { responseType: 'blob' });
  }

  viewFile(fileId: string) {
    return this.http.get(`${this.baseUrl}/view/${fileId}`, { responseType: 'blob' });
  }
  getFileUrl(fileId: string) {
    return `${this.baseUrl}/view/${fileId}`;
  }
}


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class StudentService {
//   private baseUrl = 'http://localhost:8080/crackit/v1/student';
//
//   constructor(private http: HttpClient) {}
//
//   private getAuthHeaders(): HttpHeaders {
//     const token = localStorage.getItem('authToken'); // Récupérer le token du stockage
//     return new HttpHeaders({
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     });
//   }
//
//   getAllChapters(): Observable<string[]> {
//     return this.http.get<string[]>(`${this.baseUrl}/chapters`, { headers: this.getAuthHeaders() });
//   }
//
//   getChapterDetails(chapterName: string): Observable<any> {
//     const encodedName = encodeURIComponent(chapterName);
//     return this.http.get<any>(`${this.baseUrl}/chapter/${encodedName}`, { headers: this.getAuthHeaders() });
//   }
// }
