import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const mockArticles = [
    { id: 1, etat: 'FRESH', description: 'Rein', prix: 150, dateExtraction: new Date('2026-01-01'), idBodyPart: { id: 1, nameBodyPart: 'Rein' } },
    { id: 2, etat: 'FROZEN', description: 'Foie', prix: 200, dateExtraction: new Date('2026-01-02'), idBodyPart: { id: 2, nameBodyPart: 'Foie' } }
  ] as any[];

  const mockBodyParts = [
    { id: 1, nameBodyPart: 'Rein' },
    { id: 2, nameBodyPart: 'Foie' },
    { id: 3, nameBodyPart: 'Cœur' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAllArticles()', () => {
    it('GIVEN articles exist WHEN getAllArticles is called THEN should return all articles', (done) => {
      // GIVEN: Des articles existent

      // WHEN: On récupère tous les articles
      service.getAllArticles().subscribe(articles => {
        // THEN: Tous les articles doivent être retournés
        expect(articles.length).toBe(2);
        expect(articles[0].etat).toBe('FRESH');
        expect(articles[1].prix).toBe(200);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/articles');
      expect(req.request.method).toBe('GET');
      req.flush(mockArticles);
    });

    it('GIVEN no articles WHEN getAllArticles is called THEN should return empty array', (done) => {
      // GIVEN: Aucun article

      // WHEN: On récupère les articles
      service.getAllArticles().subscribe(articles => {
        // THEN: Un tableau vide doit être retourné
        expect(articles).toEqual([]);
        expect(articles.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/articles');
      req.flush([]);
    });

    it('GIVEN server error WHEN getAllArticles is called THEN should retry and handle error', (done) => {
      // GIVEN: Une erreur serveur

      // WHEN: On essaie de récupérer les articles
      service.getAllArticles().subscribe(
        () => fail('Should have failed'),
        error => {
          // THEN: Une erreur doit être retournée après retry
          expect(error).toBeTruthy();
          done();
        }
      );

      // Première tentative échoue
      const req1 = httpMock.expectOne('http://localhost:8080/api/articles');
      req1.error(new ErrorEvent('Network error'));

      // Retry automatique échoue aussi
      const req2 = httpMock.expectOne('http://localhost:8080/api/articles');
      req2.error(new ErrorEvent('Network error'));
    });
  });

  describe('getArticleById()', () => {
    it('GIVEN valid articleId WHEN getArticleById is called THEN should return article', (done) => {
      // GIVEN: Un articleId valide
      const articleId = 1;

      // WHEN: On récupère l'article
      service.getArticleById(articleId).subscribe(article => {
        // THEN: L'article doit être retourné
        expect(article.id).toBe(1);
        expect(article.etat).toBe('FRESH');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/article/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockArticles[0]);
    });

    it('GIVEN non-existent articleId WHEN getArticleById is called THEN should return error', (done) => {
      // GIVEN: Un articleId inexistant
      const articleId = 999;

      // WHEN: On essaie de récupérer l'article
      service.getArticleById(articleId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // THEN: Une erreur doit être retournée
          expect(error).toBeTruthy();
          expect(error.message).toContain('404');
          done();
        }
      });

      // Première requête échoue
      const req1 = httpMock.expectOne('http://localhost:8080/api/article/999');
      req1.flush({ message: 'Article not found' }, { status: 404, statusText: 'Not Found' });

      // Le retry va faire une seconde requête
      const req2 = httpMock.expectOne('http://localhost:8080/api/article/999');
      req2.flush({ message: 'Article not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getAllBodyParts()', () => {
    it('GIVEN body parts exist WHEN getAllBodyParts is called THEN should return all body parts', (done) => {
      // GIVEN: Des parties du corps existent

      // WHEN: On récupère toutes les parties
      service.getAllBodyParts().subscribe(bodyParts => {
        // THEN: Toutes les parties doivent être retournées
        expect(bodyParts).toEqual(mockBodyParts);
        expect(bodyParts.length).toBe(3);
        expect(bodyParts[0].nameBodyPart).toBe('Rein');
        expect(bodyParts[2].nameBodyPart).toBe('Cœur');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyParts');
      expect(req.request.method).toBe('GET');
      req.flush(mockBodyParts);
    });
  });

  describe('createBodyPart()', () => {
    it('GIVEN valid body part WHEN createBodyPart is called THEN should create body part', (done) => {
      // GIVEN: Une partie du corps valide
      const newBodyPart = { nameBodyPart: 'Pancréas' };
      const createdBodyPart = { id: 4, nameBodyPart: 'Pancréas' };

      // WHEN: On crée la partie du corps
      service.createBodyPart(newBodyPart as any).subscribe(bodyPart => {
        // THEN: La partie doit être créée avec un ID
        expect(bodyPart).toEqual(createdBodyPart);
        expect(bodyPart.id).toBe(4);
        expect(bodyPart.nameBodyPart).toBe('Pancréas');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyParts');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newBodyPart);
      req.flush(createdBodyPart);
    });

    it('GIVEN invalid body part WHEN createBodyPart is called THEN should return error', (done) => {
      // GIVEN: Une partie du corps invalide (nom vide)
      const invalidBodyPart = { nameBodyPart: '' };

      // WHEN: On essaie de créer la partie
      service.createBodyPart(invalidBodyPart as any).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // THEN: Une erreur de validation doit être retournée
          expect(error).toBeTruthy();
          expect(error.message).toContain('400');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyParts');
      req.flush({ message: 'Name is required' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateBodyPart()', () => {
    it('GIVEN valid body part WHEN updateBodyPart is called THEN should update body part', (done) => {
      // GIVEN: Une partie du corps valide à mettre à jour
      const bodyPartId = 1;
      const updatedBodyPart = { id: 1, nameBodyPart: 'Rein Gauche' };

      // WHEN: On met à jour la partie
      service.updateBodyPart(bodyPartId, updatedBodyPart as any).subscribe(bodyPart => {
        // THEN: La partie doit être mise à jour
        expect(bodyPart).toEqual(updatedBodyPart);
        expect(bodyPart.nameBodyPart).toBe('Rein Gauche');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyPart/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedBodyPart);
      req.flush(updatedBodyPart);
    });

    it('GIVEN non-existent body part WHEN updateBodyPart is called THEN should return error', (done) => {
      // GIVEN: Une partie du corps inexistante
      const bodyPartId = 999;
      const updatedBodyPart = { id: 999, nameBodyPart: 'Test' };

      // WHEN: On essaie de mettre à jour
      service.updateBodyPart(bodyPartId, updatedBodyPart as any).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // THEN: Une erreur 404 doit être retournée
          expect(error).toBeTruthy();
          expect(error.message).toContain('404');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyPart/999');
      req.flush({ message: 'Body part not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteBodyPart()', () => {
    it('GIVEN valid body part id WHEN deleteBodyPart is called THEN should delete body part', (done) => {
      // GIVEN: Un ID de partie du corps valide
      const bodyPartId = 1;

      // WHEN: On supprime la partie
      service.deleteBodyPart(bodyPartId).subscribe(() => {
        // THEN: La partie doit être supprimée
        expect(true).toBeTruthy(); // Delete ne retourne rien
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyPart/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('GIVEN body part with associated articles WHEN deleteBodyPart is called THEN should return error', (done) => {
      // GIVEN: Une partie du corps avec des articles associés
      const bodyPartId = 1;

      // WHEN: On essaie de supprimer
      service.deleteBodyPart(bodyPartId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // THEN: Une erreur de contrainte doit être retournée
          expect(error).toBeTruthy();
          expect(error.message).toContain('409');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/bodyPart/1');
      req.flush(
        { message: 'Cannot delete body part with associated articles' },
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('getArticlesByBodyPartId()', () => {
    it('GIVEN valid bodyPartId WHEN getArticlesByBodyPartId is called THEN should return filtered articles', (done) => {
      // GIVEN: Un bodyPartId valide
      const bodyPartId = 1;
      const filteredArticles = [mockArticles[0]];

      // WHEN: On récupère les articles par partie du corps
      service.getArticlesByBodyPartId(bodyPartId).subscribe(articles => {
        // THEN: Les articles filtrés doivent être retournés
        expect(articles.length).toBe(1);
        if (articles[0] && articles[0].idBodyPart) {
          expect(articles[0].idBodyPart.id).toBe(1);
        }
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/articles/bodyPart/1');
      expect(req.request.method).toBe('GET');
      req.flush(filteredArticles);
    });

    it('GIVEN bodyPart with no articles WHEN getArticlesByBodyPartId is called THEN should return empty array', (done) => {
      // GIVEN: Une partie du corps sans articles
      const bodyPartId = 999;

      // WHEN: On récupère les articles
      service.getArticlesByBodyPartId(bodyPartId).subscribe(articles => {
        // THEN: Un tableau vide doit être retourné
        expect(articles).toEqual([]);
        expect(articles.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/articles/bodyPart/999');
      req.flush([]);
    });
  });
});

