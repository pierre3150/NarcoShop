import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentCard {
  id?: number;
  codeCb: number;
  ccv: number;
  expiryDate: string;
  userId?: number;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/cards';

  constructor(private http: HttpClient) { }

getCardsByUserId(userId: number): Observable<PaymentCard[]> {
    return this.http.get<PaymentCard[]>(`${this.baseUrl}/user/${userId}`);
  }

addCard(card: PaymentCard): Observable<any> {
    return this.http.post(this.baseUrl, card);
  }

updateCard(cardId: number, updates: Partial<PaymentCard>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${cardId}`, updates);
  }

deleteCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${cardId}`);
  }

getAllCards(): Observable<PaymentCard[]> {
    return this.http.get<PaymentCard[]>(`${this.baseUrl}/all`);
  }
}
