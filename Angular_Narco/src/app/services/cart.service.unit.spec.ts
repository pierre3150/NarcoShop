import { of, throwError, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

// ─── Logique pure CartService ─────────────────────────────────
class CartServiceLogic {
  private baseUrl = 'http://localhost:8080/api/cart';
  private countSub = new BehaviorSubject<number>(0);
  public cartItemCount$ = this.countSub.asObservable();

  constructor(private http: any) {}

  getUserCart(userId: number) {
    return this.http.get(`${this.baseUrl}/user/${userId}`).pipe(
      tap((c: any) => this.countSub.next(c.itemCount))
    );
  }

  addToCart(userId: number, articleId: number) {
    return this.http.post(`${this.baseUrl}/add`, { userId, articleId });
  }

  removeFromCart(cartId: number, bodyPartId: number) {
    return this.http.delete(`${this.baseUrl}/remove/${cartId}/${bodyPartId}`);
  }

  clearCart(cartId: number) {
    return this.http.delete(`${this.baseUrl}/clear/${cartId}`).pipe(tap(() => this.countSub.next(0)));
  }

  checkout(cartId: number) {
    return this.http.post(`${this.baseUrl}/checkout/${cartId}`, {}).pipe(tap(() => this.countSub.next(0)));
  }

  updateCartCount(n: number) { this.countSub.next(n); }
  getOrderHistory(userId: number) { return this.http.get(`${this.baseUrl}/history/${userId}`); }
}

const mockHttp = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
const mockCart = { cartId: 1, items: [{ bodyPartId: 1 }], totalPrice: '150.00', itemCount: 1, dateCreation: '' };

describe('CartService — Tests Unitaires', () => {
  let service: CartServiceLogic;

  beforeEach(() => { jest.clearAllMocks(); service = new CartServiceLogic(mockHttp); });

  it('GIVEN userId WHEN getUserCart() THEN appelle GET /cart/user/{id} et met à jour cartItemCount$', (done) => {
    mockHttp.get.mockReturnValue(of(mockCart));
    service.getUserCart(1).subscribe();
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('/cart/user/1'));
    service.cartItemCount$.subscribe(n => { expect(n).toBe(1); done(); });
  });

  it('GIVEN userId et articleId WHEN addToCart() THEN appelle POST /cart/add avec le bon body', () => {
    mockHttp.post.mockReturnValue(of({ success: true }));
    service.addToCart(1, 5).subscribe();
    expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('/cart/add'), { userId: 1, articleId: 5 });
  });

  it('GIVEN cartId et bodyPartId WHEN removeFromCart() THEN appelle DELETE /cart/remove/{c}/{b}', () => {
    mockHttp.delete.mockReturnValue(of({}));
    service.removeFromCart(1, 2).subscribe();
    expect(mockHttp.delete).toHaveBeenCalledWith(expect.stringContaining('/cart/remove/1/2'));
  });

  it('GIVEN clear réussi WHEN clearCart() THEN cartItemCount$ repasse à 0', (done) => {
    mockHttp.delete.mockReturnValue(of({}));
    service.updateCartCount(5);
    service.clearCart(1).subscribe();
    service.cartItemCount$.subscribe(n => { expect(n).toBe(0); done(); });
  });

  it('GIVEN checkout réussi WHEN checkout() THEN cartItemCount$ repasse à 0', (done) => {
    mockHttp.post.mockReturnValue(of({ success: true }));
    service.updateCartCount(3);
    service.checkout(1).subscribe();
    service.cartItemCount$.subscribe(n => { expect(n).toBe(0); done(); });
  });

  it('GIVEN erreur serveur WHEN checkout() THEN propage l\'erreur', (done) => {
    mockHttp.post.mockReturnValue(throwError(() => ({ status: 500 })));
    service.checkout(1).subscribe({ error: (e: any) => { expect(e.status).toBe(500); done(); } });
  });
});
