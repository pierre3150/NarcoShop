import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, UserCredentials } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:8080/api/auth';

  const mockUser = { id: 1, username: 'admin', role: 'ADMIN', message: 'Connexion réussie !' };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ─── Création ─────────────────────────────────────────────────
  describe('Création', () => {
    it('GIVEN le module WHEN injecté THEN devrait être créé', () => {
      expect(service).toBeTruthy();
    });

    it('GIVEN localStorage vide WHEN créé THEN isLoggedIn est false', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('GIVEN localStorage vide WHEN créé THEN getCurrentUser retourne null', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  // ─── login() ──────────────────────────────────────────────────
  describe('login()', () => {
    const creds: UserCredentials = { username: 'admin', password: 'admin1234' };

    it('GIVEN identifiants valides WHEN login() THEN retourne la réponse du serveur', (done) => {
      service.login(creds).subscribe(res => {
        expect(res).toEqual(mockUser);
        done();
      });
      httpMock.expectOne(`${BASE}/login`).flush(mockUser);
    });

    it('GIVEN identifiants valides WHEN login() THEN le mot de passe est haché (SHA-256 = 64 hex)', () => {
      service.login(creds).subscribe();
      const req = httpMock.expectOne(`${BASE}/login`);
      expect(req.request.body.password).not.toBe('admin1234');
      expect(req.request.body.password.length).toBe(64);
      req.flush(mockUser);
    });

    it('GIVEN login réussi WHEN login() THEN sauvegarde dans localStorage', () => {
      service.login(creds).subscribe();
      httpMock.expectOne(`${BASE}/login`).flush(mockUser);
      expect(JSON.parse(localStorage.getItem('currentUser')!).username).toBe('admin');
    });

    it('GIVEN login réussi WHEN login() THEN isLoggedIn vaut true', () => {
      service.login(creds).subscribe();
      httpMock.expectOne(`${BASE}/login`).flush(mockUser);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('GIVEN login réussi WHEN login() THEN getCurrentUser retourne l\'utilisateur', () => {
      service.login(creds).subscribe();
      httpMock.expectOne(`${BASE}/login`).flush(mockUser);
      expect(service.getCurrentUser().username).toBe('admin');
    });

    it('GIVEN login réussi WHEN login() THEN currentUser$ émet l\'utilisateur', fakeAsync(() => {
      let emitted: any;
      service.currentUser$.subscribe(u => emitted = u);
      service.login(creds).subscribe();
      httpMock.expectOne(`${BASE}/login`).flush(mockUser);
      tick();
      expect(emitted.username).toBe('admin');
    }));

    it('GIVEN erreur 401 WHEN login() THEN propage l\'erreur', () => {
      let errorCaught = false;
      service.login(creds).subscribe({ error: () => errorCaught = true });
      httpMock.expectOne(`${BASE}/login`).flush(
        { message: 'Identifiants invalides' }, { status: 401, statusText: 'Unauthorized' }
      );
      expect(errorCaught).toBe(true);
    });

    it('GIVEN erreur serveur WHEN login() THEN localStorage reste vide', () => {
      service.login(creds).subscribe({ error: () => {} });
      httpMock.expectOne(`${BASE}/login`).flush({}, { status: 401, statusText: 'Unauthorized' });
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  // ─── register() ───────────────────────────────────────────────
  describe('register()', () => {
    const creds: UserCredentials = { username: 'newuser', password: 'pass123', adresse: '1 rue test' };
    const mockRegResp = { id: 2, username: 'newuser', message: 'Inscription réussie !' };

    it('GIVEN données valides WHEN register() THEN envoie vers le bon endpoint POST', () => {
      service.register(creds).subscribe();
      const req = httpMock.expectOne(`${BASE}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockRegResp);
    });

    it('GIVEN données valides WHEN register() THEN le mot de passe est haché', () => {
      service.register(creds).subscribe();
      const req = httpMock.expectOne(`${BASE}/register`);
      expect(req.request.body.password).not.toBe('pass123');
      expect(req.request.body.password.length).toBe(64);
      req.flush(mockRegResp);
    });

    it('GIVEN données valides WHEN register() THEN envoie l\'adresse en clair', () => {
      service.register(creds).subscribe();
      const req = httpMock.expectOne(`${BASE}/register`);
      expect(req.request.body.adresse).toBe('1 rue test');
      req.flush(mockRegResp);
    });

    it('GIVEN inscription réussie WHEN register() THEN isLoggedIn vaut true', () => {
      service.register(creds).subscribe();
      httpMock.expectOne(`${BASE}/register`).flush(mockRegResp);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('GIVEN username existant WHEN register() THEN propage l\'erreur 409', () => {
      let errorCaught = false;
      service.register(creds).subscribe({ error: () => errorCaught = true });
      httpMock.expectOne(`${BASE}/register`).flush(
        { message: 'Utilisateur déjà existant' }, { status: 409, statusText: 'Conflict' }
      );
      expect(errorCaught).toBe(true);
    });
  });

  // ─── logout() ─────────────────────────────────────────────────
  describe('logout()', () => {
    beforeEach(() => {
      // Simuler un utilisateur connecté
      service.login({ username: 'admin', password: 'admin1234' }).subscribe();
      httpMock.expectOne(`${BASE}/login`).flush(mockUser);
    });

    it('GIVEN utilisateur connecté WHEN logout() THEN isLoggedIn vaut false', () => {
      service.logout();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('GIVEN utilisateur connecté WHEN logout() THEN vide le localStorage', () => {
      service.logout();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('GIVEN utilisateur connecté WHEN logout() THEN getCurrentUser retourne null', () => {
      service.logout();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('GIVEN utilisateur connecté WHEN logout() THEN currentUser$ émet null', fakeAsync(() => {
      let lastValue: any = 'initial';
      service.currentUser$.subscribe(v => lastValue = v);
      service.logout();
      tick();
      expect(lastValue).toBeNull();
    }));
  });

  // ─── checkUsername() ──────────────────────────────────────────
  describe('checkUsername()', () => {
    it('GIVEN un username WHEN checkUsername() THEN appelle GET /check/{username}', () => {
      service.checkUsername('testuser').subscribe();
      const req = httpMock.expectOne(`${BASE}/check/testuser`);
      expect(req.request.method).toBe('GET');
      req.flush({ exists: false });
    });

    it('GIVEN un username existant WHEN checkUsername() THEN retourne exists: true', (done) => {
      service.checkUsername('admin').subscribe(res => {
        expect(res.exists).toBe(true);
        done();
      });
      httpMock.expectOne(`${BASE}/check/admin`).flush({ exists: true });
    });
  });
});

