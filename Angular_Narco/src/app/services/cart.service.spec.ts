import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService, Cart, CartItem } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:8080/api/cart';

  const mockItem: CartItem = {
    bodyPartId: 1, bodyPartName: 'Rein', articleId: 5,
    articleName: 'Rein - FRESH', price: '150.00', state: 'FRESH',
    dateAjout: '2026-01-09T12:00:00Z'
  };

  const mockCart: Cart = {
    cartId: 1, items: [mockItem], totalPrice: '150.00',
    itemCount: 1, dateCreation: '2026-01-09T10:00:00Z'
  };

  const emptyCart: Cart = {
    cartId: 1, items: [], totalPrice: '0.00',
    itemCount: 0, dateCreation: '2026-01-09T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── Création ─────────────────────────────────────────────────
  describe('Création', () => {
    it('GIVEN le module WHEN injecté THEN devrait être créé', () => {
      expect(service).toBeTruthy();
    });

    it('GIVEN création WHEN cartItemCount$ THEN émet 0 par défaut', fakeAsync(() => {
      let count = -1;
      service.cartItemCount$.subscribe(c => count = c);
      tick();
      expect(count).toBe(0);
    }));
  });

  // ─── getUserCart() ────────────────────────────────────────────
  describe('getUserCart()', () => {
    it('GIVEN userId WHEN getUserCart() THEN appelle GET /cart/user/{id}', () => {
      service.getUserCart(1).subscribe();
      const req = httpMock.expectOne(`${BASE}/user/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCart);
    });

    it('GIVEN réponse serveur WHEN getUserCart() THEN retourne le panier', (done) => {
      service.getUserCart(1).subscribe(cart => {
        expect(cart).toEqual(mockCart);
        expect(cart.items.length).toBe(1);
        done();
      });
      httpMock.expectOne(`${BASE}/user/1`).flush(mockCart);
    });

    it('GIVEN panier chargé WHEN getUserCart() THEN met à jour cartItemCount$', fakeAsync(() => {
      let count = 0;
      service.cartItemCount$.subscribe(c => count = c);
      service.getUserCart(1).subscribe();
      httpMock.expectOne(`${BASE}/user/1`).flush(mockCart);
      tick();
      expect(count).toBe(1);
    }));

    it('GIVEN panier vide WHEN getUserCart() THEN itemCount est 0', (done) => {
      service.getUserCart(1).subscribe(cart => {
        expect(cart.itemCount).toBe(0);
        expect(cart.items.length).toBe(0);
        done();
      });
      httpMock.expectOne(`${BASE}/user/1`).flush(emptyCart);
    });

    it('GIVEN erreur réseau WHEN getUserCart() THEN propage l\'erreur', () => {
      let errorCaught = false;
      service.getUserCart(1).subscribe({ error: () => errorCaught = true });
      httpMock.expectOne(`${BASE}/user/1`).error(new ErrorEvent('Network error'));
      expect(errorCaught).toBe(true);
    });
  });

  // ─── addToCart() ──────────────────────────────────────────────
  describe('addToCart()', () => {
    it('GIVEN userId et articleId WHEN addToCart() THEN envoie POST /cart/add', () => {
      service.addToCart(1, 5).subscribe();
      const req = httpMock.expectOne(`${BASE}/add`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userId: 1, articleId: 5 });
      req.flush({ success: true });
    });

    it('GIVEN article déjà dans le panier WHEN addToCart() THEN propage l\'erreur', () => {
      let errorCaught = false;
      service.addToCart(1, 5).subscribe({ error: () => errorCaught = true });
      httpMock.expectOne(`${BASE}/add`).flush(
        { message: 'Déjà dans le panier' }, { status: 400, statusText: 'Bad Request' }
      );
      expect(errorCaught).toBe(true);
    });
  });

  // ─── removeFromCart() ─────────────────────────────────────────
  describe('removeFromCart()', () => {
    it('GIVEN cartId et bodyPartId WHEN removeFromCart() THEN envoie DELETE', () => {
      service.removeFromCart(1, 1).subscribe();
      const req = httpMock.expectOne(`${BASE}/remove/1/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('GIVEN suppression réussie WHEN removeFromCart() THEN complète sans erreur', (done) => {
      service.removeFromCart(1, 1).subscribe({ complete: () => done() });
      httpMock.expectOne(`${BASE}/remove/1/1`).flush({});
    });
  });

  // ─── clearCart() ──────────────────────────────────────────────
  describe('clearCart()', () => {
    it('GIVEN cartId WHEN clearCart() THEN envoie DELETE /cart/clear/{id}', () => {
      service.clearCart(1).subscribe();
      const req = httpMock.expectOne(`${BASE}/clear/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('GIVEN clear réussi WHEN clearCart() THEN cartItemCount$ émet 0', fakeAsync(() => {
      let count = 5;
      service.updateCartCount(5);
      service.cartItemCount$.subscribe(c => count = c);
      service.clearCart(1).subscribe();
      httpMock.expectOne(`${BASE}/clear/1`).flush({});
      tick();
      expect(count).toBe(0);
    }));
  });

  // ─── checkout() ───────────────────────────────────────────────
  describe('checkout()', () => {
    it('GIVEN cartId WHEN checkout() THEN envoie POST /cart/checkout/{id}', () => {
      service.checkout(1).subscribe();
      const req = httpMock.expectOne(`${BASE}/checkout/1`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true });
    });

    it('GIVEN checkout réussi WHEN checkout() THEN cartItemCount$ émet 0', fakeAsync(() => {
      let count = 3;
      service.updateCartCount(3);
      service.cartItemCount$.subscribe(c => count = c);
      service.checkout(1).subscribe();
      httpMock.expectOne(`${BASE}/checkout/1`).flush({ success: true });
      tick();
      expect(count).toBe(0);
    }));

    it('GIVEN erreur serveur WHEN checkout() THEN propage l\'erreur', () => {
      let errorCaught = false;
      service.checkout(1).subscribe({ error: () => errorCaught = true });
      httpMock.expectOne(`${BASE}/checkout/1`).flush(
        { message: 'Erreur' }, { status: 500, statusText: 'Internal Server Error' }
      );
      expect(errorCaught).toBe(true);
    });
  });

  // ─── getOrderHistory() ────────────────────────────────────────
  describe('getOrderHistory()', () => {
    const mockHistory = [
      { orderId: 1, totalPrice: '300.00', status: 'DELIVERED' }
    ];

    it('GIVEN userId WHEN getOrderHistory() THEN appelle GET /cart/history/{id}', () => {
      service.getOrderHistory(1).subscribe();
      const req = httpMock.expectOne(`${BASE}/history/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('GIVEN historique existant WHEN getOrderHistory() THEN retourne la liste', (done) => {
      service.getOrderHistory(1).subscribe(history => {
        expect(history.length).toBe(1);
        expect(history[0].status).toBe('DELIVERED');
        done();
      });
      httpMock.expectOne(`${BASE}/history/1`).flush(mockHistory);
    });

    it('GIVEN aucun historique WHEN getOrderHistory() THEN retourne tableau vide', (done) => {
      service.getOrderHistory(1).subscribe(history => {
        expect(history.length).toBe(0);
        done();
      });
      httpMock.expectOne(`${BASE}/history/1`).flush([]);
    });
  });

  // ─── updateCartCount() ────────────────────────────────────────
  describe('updateCartCount()', () => {
    it('GIVEN un nombre WHEN updateCartCount() THEN cartItemCount$ émet cette valeur', fakeAsync(() => {
      let count = 0;
      service.cartItemCount$.subscribe(c => count = c);
      service.updateCartCount(7);
      tick();
      expect(count).toBe(7);
    }));
  });
});

