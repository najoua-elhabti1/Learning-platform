import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = 'http://localhost:8080/crackit/v1/auth/';
  private uploadUrl = 'http://localhost:8080/crackit/v1/admin/import';
  private uploadChapterUrl = 'http://localhost:8080/crackit/v1/prof/upload_course';
  private uploadQuestionUrl = 'http://localhost:8080/crackit/v1/prof/upload_questions';
  private clearDatabaseUrl = 'http://localhost:8080/crackit/v1/admin/clear-students'
  private registerUsersUrl = 'http://localhost:8080/crackit/v1/admin/register-users';
  private AllChapitersUrl = 'http://localhost:8080/crackit/v1/prof';


  constructor(private http: HttpClient) { }

  login(obj: any) {
    return this.http.post(this.apiUrl + 'authenticate', obj);
  }

  logout() {
    // if (this.token) {
    //   const headers = new HttpHeaders({
    //     'Authorization': `Bearer ${JSON.parse(this.token)}`
    //   });
    //   return this.http.post(this.apiUrl + 'logout', {}, { headers });
    // } else {
    //   console.log('No access token found');
    //   return of('No access token found');
    // }
    return this.http.post(this.apiUrl + 'logout', {});
  }

  getUserInfo(accessToken: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}userinfo`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching authenticated user information:', error);
          alert('Failed to fetch user information. Please try again later.');
          return throwError(error);
        })
      );
  }

  handlePasswordReset(obj: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(this.apiUrl + 'request', obj, { headers, responseType: 'text' as 'json' });
  }

  resetPassword(password: string, token: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}reset`, password, {
      headers,
      params: { token },
      responseType: 'text' as 'json'
    });
  }
  isTokenExpired(token: string | null): Observable<string> {
      const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<string>(`${this.apiUrl}is-token-expired`, { token }, {
      headers,
      responseType: 'text' as 'json'
    });
  }

  uploadFile(file: File): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const formData = new FormData();
      formData.append('file', file);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`
      });

      return this.http.post(this.uploadUrl, formData, { headers });
    } else {
      console.log('No access token found');
      return of('No access token found');
    }
  }

  registerUsers(): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`
      });

      return this.http.post(this.registerUsersUrl, {}, { headers });
    } else {
      console.log('No access token found');
      return of('No access token found');
    }
  }

  uploadChapter(file: File,chapter: string, course: string, isVisible :boolean): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chapter', chapter);
      formData.append('course', course);
      console.log(formData.get('chapter'));
      formData.append('isVisible', String(isVisible));


      const headers = new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`,

      });

      return this.http.post(this.uploadChapterUrl, formData, { headers });
    } else {
      console.log('No access token found');
      return of('No access token found');
    }


  }

  getAllCourses(): Observable<FileDocument[]> {
    const token = localStorage.getItem('access_token');
    if (token) {

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`,

      });

    return this.http.get<FileDocument[]>(`${this.AllChapitersUrl}/all_courses`, { headers });
  }else {
    console.log('No access token found');
    return of([]); // Return an empty array to match the expected return type
  }

}
downloadCourse(courseId: string, fileName: string): Observable<any> {
  const token = localStorage.getItem('access_token');
  if (token) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,
      'Content-Type': 'application/json',
      'Accept': 'application/octet-stream',

    });

  return this.http.get(`${this.AllChapitersUrl}/download/${courseId}`, { headers, responseType: 'blob' });
}else {
  console.log('No access token found');
  return of('No access token found');
}

}






updateQuestion(id: number, updatedQuestion: QuestionReponse): Observable<QuestionReponse> {
  const token = localStorage.getItem('access_token');
  if (token) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,

    });

  return this.http.put<QuestionReponse>(`${this.AllChapitersUrl}/update/${id}`, updatedQuestion, { headers });
}else {
  console.log('No access token found');
  return of();
}
}

getQuestion(numQuestion: number) : Observable<any>{
  const token = localStorage.getItem('access_token');
  if (token) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,

    });

  return this.http.get<QuestionReponse>(`${this.AllChapitersUrl}/getQuestion/${numQuestion}`, { headers });
}else {
  console.log('No access token found');
  return of([]);
}

}


currentUser() {
  const user = localStorage.getItem('connectedUser');
  return user ? JSON.parse(user) : null;
}

updateVisibility(courseId: string, isVisible: boolean): Observable<any>  {
  const token = localStorage.getItem('access_token');
  if (token) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,
      'Content-Type': 'application/json',

    });

  return this.http.put<any>(`${this.AllChapitersUrl}/${courseId}/visibility`,  isVisible  , { headers });
}else {
  console.log('No access token found');
  return of([]); // Return an empty array to match the expected return type
}

}

changePassword(email: string, oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
  const token = localStorage.getItem('access_token');
  if (token) {

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${JSON.parse(token)}`,


    });
  const payload = {
    email: email,
    oldPassword: oldPassword,
    newPassword: newPassword,
    confirmPassword: confirmPassword,
  };

  return this.http.post<any>(this.apiUrl+'change-password', payload, {headers, responseType: 'text' as 'json'});
}else {
  console.log('No access token found');
  return of([]); // Return an empty array to match the expected return type
}
}
  clearDatabase(): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${JSON.parse(token)}`
      });
      return this.http.delete(this.clearDatabaseUrl, { headers })
        .pipe(
          catchError(error => {
            console.error('Erreur lors de la suppression de la base de données:', error);
            return throwError(error);
          })
        );
    } else {
      console.log('No access token found');
      return of('No access token found');
    }
  }


}
export interface FileDocument {
  id: string;
  fileName: string;
  contentType: string;
  chapter: string;
  course: string;
  objectifs?: string;
  plan?: string;
  introduction?: string;
  conclusion?: string;
  data?: string;
  isVisible: boolean;
}
export interface QuestionReponse {
  numQuestion: number;
  question: string;
  course: string;
  chapter: string;
  response: string;
  imagePath: string;

}
