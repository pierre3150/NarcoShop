import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Article } from '../models/article.model';
import { BodyPart } from '../models/body-part.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {

      errorMessage = `Erreur: ${error.error.message}`;
    } else {

      errorMessage = `Code erreur: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/articles`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/article/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getArticlesByBodyPartId(bodyPartId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/articles/bodyPart/${bodyPartId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(`${this.baseUrl}/articles`, article)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateArticle(id: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/article/${id}`, article)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/article/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllBodyParts(): Observable<BodyPart[]> {
    return this.http.get<BodyPart[]>(`${this.baseUrl}/bodyParts`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getBodyPartById(id: number): Observable<BodyPart> {
    return this.http.get<BodyPart>(`${this.baseUrl}/bodyPart/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createBodyPart(bodyPart: BodyPart): Observable<BodyPart> {
    return this.http.post<BodyPart>(`${this.baseUrl}/bodyParts`, bodyPart)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateBodyPart(id: number, bodyPart: BodyPart): Observable<BodyPart> {
    return this.http.put<BodyPart>(`${this.baseUrl}/bodyPart/${id}`, bodyPart)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteBodyPart(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bodyPart/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}
