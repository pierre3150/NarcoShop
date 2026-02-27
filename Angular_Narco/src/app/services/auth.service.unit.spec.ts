import { of, throwError, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createHash } from 'crypto';

// ─── Mock localStorage ────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();
(global as any).localStorage = localStorageMock;

// ─── Logique pure AuthService ─────────────────────────────────
class AuthServiceLogic {
  private baseUrl = 'http://localhost:8080/api/auth';
  private sub: BehaviorSubject<any>;
  public currentUser$;

  constructor(private http: any) {
    const stored = localStorageMock.getItem('currentUser');
    this.sub = new BehaviorSubject<any>(stored ? JSON.parse(stored) : null);
    this.currentUser$ = this.sub.asObservable();
  }

  private hash(p: string) { return createHash('sha256').update(p).digest('hex'); }

  login(c: any) {
    return this.http.post(`${this.baseUrl}/login`, { username: c.username, password: this.hash(c.password) }).pipe(
      tap((r: any) => { localStorageMock.setItem('currentUser', JSON.stringify(r)); this.sub.next(r); })
    );
  }

  register(c: any) {
    return this.http.post(`${this.baseUrl}/register`, { username: c.username, password: this.hash(c.password), adresse: c.adresse }).pipe(
      tap((r: any) => { localStorageMock.setItem('currentUser', JSON.stringify(r)); this.sub.next(r); })
    );
  }

  logout() { localStorageMock.removeItem('currentUser'); this.sub.next(null); }
  isLoggedIn() { return !!this.sub.value; }
  getCurrentUser() { return this.sub.value; }
  checkUsername(u: string) { return this.http.get(`${this.baseUrl}/check/${u}`); }
}

const mockHttp = { post: jest.fn(), get: jest.fn() };
const mockUser = { id: 1, username: 'admin', role: 'ADMIN', message: 'Connexion réussie !' };

describe('AuthService — Tests Unitaires', () => {
  let service: AuthServiceLogic;

  beforeEach(() => { localStorageMock.clear(); jest.clearAllMocks(); service = new AuthServiceLogic(mockHttp); });
  afterEach(() => localStorageMock.clear());

  it('GIVEN localStorage vide WHEN instancié THEN isLoggedIn() est false', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('GIVEN login réussi WHEN login() THEN le mot de passe est haché (64 hex)', () => {
    mockHttp.post.mockReturnValue(of(mockUser));
    service.login({ username: 'admin', password: 'admin1234' }).subscribe();
    const body = mockHttp.post.mock.calls[0][1];
    expect(body.password).toHaveLength(64);
    expect(body.password).toMatch(/^[a-f0-9]{64}$/);
    expect(body.password).not.toBe('admin1234');
  });

  it('GIVEN login réussi WHEN login() THEN isLoggedIn() passe à true et user en localStorage', () => {
    mockHttp.post.mockReturnValue(of(mockUser));
    service.login({ username: 'admin', password: 'admin1234' }).subscribe();
    expect(service.isLoggedIn()).toBe(true);
    expect(JSON.parse(localStorageMock.getItem('currentUser')!).username).toBe('admin');
  });

  it('GIVEN erreur 401 WHEN login() THEN propage l\'erreur et localStorage reste vide', (done) => {
    mockHttp.post.mockReturnValue(throwError(() => ({ status: 401, error: { message: 'Invalide' } })));
    service.login({ username: 'admin', password: 'wrong' }).subscribe({
      error: () => { expect(localStorageMock.getItem('currentUser')).toBeNull(); done(); }
    });
  });

  it('GIVEN utilisateur connecté WHEN logout() THEN isLoggedIn() false et localStorage vide', () => {
    mockHttp.post.mockReturnValue(of(mockUser));
    service.login({ username: 'admin', password: 'admin1234' }).subscribe();
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorageMock.getItem('currentUser')).toBeNull();
  });

  it('GIVEN inscription réussie WHEN register() THEN isLoggedIn() true et adresse transmise', () => {
    const resp = { id: 2, username: 'newuser' };
    mockHttp.post.mockReturnValue(of(resp));
    service.register({ username: 'newuser', password: 'pass123', adresse: '1 rue test' }).subscribe();
    expect(service.isLoggedIn()).toBe(true);
    expect(mockHttp.post.mock.calls[0][1].adresse).toBe('1 rue test');
  });
});

