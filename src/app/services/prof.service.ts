import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { QuestionDTO } from '../models/QuestionDTO.model';
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProfService {
  private baseUrl = 'http://localhost:8080/crackit/v1/prof';

  constructor(private http: HttpClient) {}

  addQuestionsFromExcel(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(`${this.baseUrl}/add_questions`, formData, {
      responseType: 'text' as 'json'
    });
  }

  getAllQuestions(): Observable<QuestionDTO[]> {
    return this.http.get<QuestionDTO[]>(`${this.baseUrl}/all_questions`);
  }

  deleteAllQuestions(): Observable<any> {

    return this.http.delete<any>(`${this.baseUrl}/delete_all_questions`,{responseType: 'text' as 'json'});
  }

  downloadExcelQuestions(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/questions`, {
      responseType: 'blob'
    });
  }


  addManualQuestion(chapter: string, numQuestion: number, question: string, response: string): Observable<string> {
    // Création du corps de la requête
    const body = {
      //utiliser les meme nom d' attribut qui existe dasn le backend
      chapter: chapter,
      numQuestion: numQuestion,
      question: question,
      response: response
    };

    // Envoi de la requête POST
    return this.http.post<string>(`${this.baseUrl}/add_manual_question`, body, {
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



  //ajouter endpoint to update and delete question


  getQuestionByChapterAndNumber(chapter: string, numQuestion: number): Observable<QuestionDTO> {
    const url = `${this.baseUrl}/question/${chapter}/${numQuestion}`;
    return this.http.get<QuestionDTO>(url).pipe(
      catchError(this.handleError<QuestionDTO>('getQuestionByChapterAndNumber'))
    );
  }


  updateQuestion(chapter: string, numQuestion: number, newQuestionText: string, newResponseText: string): Observable<string> {

    const body = {
      chapter: chapter,
      numQuestion: numQuestion,
      question: newQuestionText,
      response: newResponseText
    };

    // Envoi de la requête PUT
    return this.http.put<string>(`${this.baseUrl}/update_question`, body, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError<string>('updateQuestion'))
    );
  }
  deleteQuestionByChapterAndNumber(chapter: string, numQuestion: number): Observable<string> {
    const url = `${this.baseUrl}/question/${chapter}/${numQuestion}`;
    return this.http.delete<string>(url, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(this.handleError<string>('deleteQuestionByChapterAndNumber'))
    );
  }


}
