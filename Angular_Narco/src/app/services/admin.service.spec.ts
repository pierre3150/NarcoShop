import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const mockUsers = [
    { id: 1, username: 'user1', adresse: 'Address 1', role: 'USER', orderCount: 2, cardCount: 1 },
    { id: 2, username: 'admin1', adresse: 'Address 2', role: 'ADMIN', orderCount: 5, cardCount: 2 }
  ];

  const mockOrders = [
    {
      orderId: 1,
      orderDate: '2026-01-09T12:00:00Z',
      userId: 1,
      username: 'user1',
      userAddress: 'Address 1',
      status: 'PENDING',
      items: [],
      totalPrice: '150.00',
      itemCount: 1
    }
  ];

  const mockStats = {
    totalUsers: 10,
    totalOrders: 25,
    totalRevenue: '5000.00',
    ordersByStatus: {
      PENDING: 5,
      PREPARING: 3,
      DELIVERED: 10,
      COMPLETED: 7
    }
  };

  const mockCards = [
    { id: 1, codeCb: 1234567812345678, ccv: 123, expiryDate: '12/25' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAllUsers()', () => {
    it('GIVEN admin request WHEN getAllUsers is called THEN should return all users', (done) => {
      // GIVEN: Une requête admin

      // WHEN: On récupère tous les utilisateurs
      service.getAllUsers().subscribe(users => {
        // THEN: Tous les utilisateurs doivent être retournés
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
        expect(users[0].username).toBe('user1');
        expect(users[1].role).toBe('ADMIN');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/admin/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('GIVEN unauthorized request WHEN getAllUsers is called THEN should return error', (done) => {
      // GIVEN: Une requête non autorisée

      // WHEN: On essaie de récupérer les utilisateurs
      service.getAllUsers().subscribe(
        () => fail('Should have failed'),
        error => {
          // THEN: Une erreur d'autorisation doit être retournée
          expect(error.status).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/admin/users');
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getAllOrders()', () => {
    it('GIVEN admin request WHEN getAllOrders is called THEN should return all orders', (done) => {
      // GIVEN: Une requête admin

      // WHEN: On récupère toutes les commandes
      service.getAllOrders().subscribe(orders => {
        // THEN: Toutes les commandes doivent être retournées
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(1);
        expect(orders[0].status).toBe('PENDING');
        expect(orders[0].username).toBe('user1');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/admin/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });
  });

  describe('updateOrderStatus()', () => {
    it('GIVEN valid orderId and status WHEN updateOrderStatus is called THEN should update status', (done) => {
      // GIVEN: Un orderId et statut valides
      const orderId = 1;
      const newStatus = 'PREPARING';

      // WHEN: On met à jour le statut
      service.updateOrderStatus(orderId, newStatus).subscribe(response => {
        // THEN: Le statut doit être mis à jour
        expect(response.message).toBe('Statut mis à jour');
        expect(response.orderId).toBe(1);
        expect(response.newStatus).toBe('PREPARING');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/admin/order/1/status');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'PREPARING' });
      req.flush({ message: 'Statut mis à jour', orderId: 1, newStatus: 'PREPARING' });
    });

    it('GIVEN invalid status WHEN updateOrderStatus is called THEN should return error', (done) => {
      // GIVEN: Un statut invalide
      const orderId = 1;
      const invalidStatus = 'INVALID_STATUS';

      // WHEN: On essaie de mettre à jour avec un statut invalide
      service.updateOrderStatus(orderId, invalidStatus).subscribe(
        () => fail('Should have failed'),
        error => {
          // THEN: Une erreur de validation doit être retournée
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/admin/order/1/status');
      req.flush({ message: 'Invalid status' }, { status: 400, statusText: 'Bad Request' });
    });

    it('GIVEN non-existent orderId WHEN updateOrderStatus is called THEN should return not found', (done) => {
      // GIVEN: Un orderId inexistant
      const orderId = 999;
      const newStatus = 'PREPARING';

      // WHEN: On essaie de mettre à jour
      service.updateOrderStatus(orderId, newStatus).subscribe(
        () => fail('Should have failed'),
        error => {
          // THEN: Une erreur 404 doit être retournée
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/admin/order/999/status');
      req.flush({ message: 'Order not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getUserCards()', () => {
    it('GIVEN valid userId WHEN getUserCards is called THEN should return user cards', (done) => {
      // GIVEN: Un userId valide
      const userId = 1;

      // WHEN: On récupère les cartes de l'utilisateur
      service.getUserCards(userId).subscribe(cards => {
        // THEN: Les cartes doivent être retournées
        expect(cards).toEqual(mockCards);
        expect(cards.length).toBe(1);
        expect(cards[0].codeCb).toBe(1234567812345678);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/admin/user/1/cards');
      expect(req.request.method).toBe('GET');
      req.flush(mockCards);
    });

    it('GIVEN user with no cards WHEN getUserCards is called THEN should return empty array', (done) => {
      // GIVEN: Un utilisateur sans cartes
      const userId = 1;

      // WHEN: On récupère les cartes
      service.getUserCards(userId).subscribe(cards => {
        // THEN: Un tableau vide doit être retourné
        expect(cards).toEqual([]);
        expect(cards.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/admin/user/1/cards');
      req.flush([]);
    });
  });

  describe('getStats()', () => {
    it('GIVEN admin request WHEN getStats is called THEN should return statistics', (done) => {
      // GIVEN: Une requête admin

      // WHEN: On récupère les statistiques
      service.getStats().subscribe(stats => {
        // THEN: Les statistiques doivent être retournées
        expect(stats).toEqual(mockStats);
        expect(stats.totalUsers).toBe(10);
        expect(stats.totalOrders).toBe(25);
        expect(stats.totalRevenue).toBe('5000.00');
        expect(stats.ordersByStatus.PENDING).toBe(5);
        expect(stats.ordersByStatus.COMPLETED).toBe(7);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/admin/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('GIVEN server error WHEN getStats is called THEN should return error', (done) => {
      // GIVEN: Une erreur serveur

      // WHEN: On essaie de récupérer les stats
      service.getStats().subscribe(
        () => fail('Should have failed'),
        error => {
          // THEN: Une erreur serveur doit être retournée
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/admin/stats');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});

