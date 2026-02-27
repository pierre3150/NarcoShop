import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  bodyPartId: number;
  bodyPartName: string;
  articleId: number;
  articleName: string;
  price: string;
  state: string;
  dateAjout: string;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalPrice: string;
  itemCount: number;
  dateCreation: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:8080/api/cart';
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  public cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(private http: HttpClient) { }

getUserCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.baseUrl}/user/${userId}`)
      .pipe(
        tap(cart => this.cartItemCountSubject.next(cart.itemCount))
      );
  }

addToCart(userId: number, articleId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, { userId, articleId });
  }

removeFromCart(cartId: number, bodyPartId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove/${cartId}/${bodyPartId}`);
  }

clearCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clear/${cartId}`)
      .pipe(
        tap(() => this.cartItemCountSubject.next(0))
      );
  }

checkout(cartId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout/${cartId}`, {})
      .pipe(
        tap(() => this.cartItemCountSubject.next(0))
      );
  }

updateCartCount(count: number): void {
    this.cartItemCountSubject.next(count);
  }

getOrderHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${userId}`);
  }
}
