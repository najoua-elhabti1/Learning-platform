import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QuestionDTO } from '../models/QuestionDTO.model';
import {CoursDocument} from "../models/course";

@Injectable({
  providedIn: 'root'
})
export class ProfService {
  private baseUrl = 'http://localhost:8080/crackit/v1/prof';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`,
        'Content-Type': 'application/json'
      });
    } else {
      console.log('No access token found');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
  }

  getUserInfo(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/userinfo`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching authenticated user information:', error);
          alert('Failed to fetch user information. Please try again later.');
          return throwError(error);
        })
      );
  }

  addQuestionsFromExcel(formData :FormData): Observable<string> {

    const token = localStorage.getItem('access_token');
    if (token) {

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`,

      });

    return this.http.post<string>(`${this.baseUrl}/add_questions`, formData, {
      headers,
      responseType: 'text' as 'json'
    });

  }else {
    console.log('No access token found');
    return of('No access token found');
  }
}

  getAllQuestions(): Observable<QuestionDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<QuestionDTO[]>(`${this.baseUrl}/all_questions`, { headers });
  }

  deleteAllQuestions(): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.delete<string>(`${this.baseUrl}/delete_all_questions`, {
      headers,
      responseType: 'text' as 'json'
    });
  }

  downloadExcelQuestions(): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/download/questions`, {
      headers,
      responseType: 'blob'
    });
  }

  addManualQuestion(obj: FormData): Observable<string> {
    const headers = this.getAuthHeaders();

    return this.http.post<string>(`${this.baseUrl}/add_manual_question`, obj, {
        headers: headers.delete('Content-Type'), // Let the browser set the Content-Type header
        responseType: 'text' as 'json'
    }).pipe(
        catchError(this.handleError<string>('addManualQuestion'))
    );
}




  getQuestionByChapterAndNumber(course: string, chapter: string, numQuestion: number): Observable<QuestionDTO> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/question/${course}/${chapter}/${numQuestion}`;
    return this.http.get<QuestionDTO>(url, { headers })
      .pipe(
        catchError(this.handleError<QuestionDTO>('getQuestionByChapterAndNumber'))
      );
  }

  updateQuestion(course: string, chapter: string, numQuestion: number, newQuestionText: string, newResponseText: string, newImageContent: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = {
      course,
      chapter,
      numQuestion,
      question: newQuestionText,
      response: newResponseText,
      imageContent : newImageContent
    };

    return this.http.put<any>(`${this.baseUrl}/update_question`, body, {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError('updateQuestion', []))    );
  }

  deleteQuestionByChapterAndNumber(course: string, chapter: string, numQuestion: number): Observable<string> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/question/${course}/${chapter}/${numQuestion}`;
    return this.http.delete<string>(url, {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError<string>('deleteQuestionByChapterAndNumber'))
    );
  }




  createCourse(courseName: string, level: number): Observable<string> {
    const params = new HttpParams()
      .set('courseName', courseName)
      .set('level', level.toString()); // Convert level to string for HttpParams

    return this.http.post<string>(`${this.baseUrl}/create_cours`, {}, { params })
      .pipe(
        catchError(this.handleError<string>('createCourse'))
      );
  }



  updateChapterVisibility(courseName: string, chapterName: string, isVisible: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/chapters/visibility`, null, {
      params: {
        courseName,
        chapterName,
        visibility: isVisible.toString()
      }
    });
  }

  // downloadCourse(courseName: string, chapterName: string): Observable<Blob> {
  //   return this.http.get(`${this.baseUrl}/download`, {
  //     params: { courseName, chapterName },
  //     responseType: 'blob'
  //   });
  // }

  getCourses2(): Observable<CoursDocument[]> {
    return this.http.get<CoursDocument[]>(`${this.baseUrl}/all_courses`);
  }
  getCourses(): Observable<{ courseName: string }[]> {
    return this.http.get<{ courseName: string }[]>(`${this.baseUrl}/all_courses`);
  }
  getChapters(): Observable<string []> {
    return this.http.get<string []>(`${this.baseUrl}/all_chapters`);
  }









  uploadChapter(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/upload_chapter_to_course`, formData, {

    }).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'envoi du chapitre:', error);
        return of(null);
      })
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  deleteChapter(courseName: string, chapterName: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/chapters/delete`, {
      headers: this.getAuthHeaders(),
      params: {
        courseName,
        chapterName
      }
    }).pipe(
      catchError(this.handleError<void>('deleteChapter'))
    );
  }

}
