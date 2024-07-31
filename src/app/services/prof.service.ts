import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QuestionDTO } from '../models/QuestionDTO.model';

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

  addQuestionsFromExcel(file: File): Observable<string> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(`${this.baseUrl}/add_questions`, formData, {
      headers,
      responseType: 'text' as 'json'
    });
  }

  getAllQuestions(): Observable<QuestionDTO[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<QuestionDTO[]>(`${this.baseUrl}/all_questions`, { headers });
  }

  deleteAllQuestions(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.baseUrl}/delete_all_questions`, {
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

  addManualQuestion(chapter: string, numQuestion: number, question: string, response: string): Observable<string> {
    const headers = this.getAuthHeaders();
    const body = {
      chapter,
      numQuestion,
      question,
      response
    };

    return this.http.post<string>(`${this.baseUrl}/add_manual_question`, body, {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError<string>('addManualQuestion'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getQuestionByChapterAndNumber(chapter: string, numQuestion: number): Observable<QuestionDTO> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/question/${chapter}/${numQuestion}`;
    return this.http.get<QuestionDTO>(url, { headers })
      .pipe(
        catchError(this.handleError<QuestionDTO>('getQuestionByChapterAndNumber'))
      );
  }

  updateQuestion(chapter: string, numQuestion: number, newQuestionText: string, newResponseText: string): Observable<string> {
    const headers = this.getAuthHeaders();
    const body = {
      chapter,
      numQuestion,
      question: newQuestionText,
      response: newResponseText
    };

    return this.http.put<string>(`${this.baseUrl}/update_question`, body, {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError<string>('updateQuestion'))
    );
  }

  deleteQuestionByChapterAndNumber(chapter: string, numQuestion: number): Observable<string> {
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/question/${chapter}/${numQuestion}`;
    return this.http.delete<string>(url, {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError<string>('deleteQuestionByChapterAndNumber'))
    );
  }
}
