import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  title = 'Narco Shop';
  subtitle = 'Votre marketplace d\'organes "légale"... ou presque ! On pose pas de questions, vous non plus';
  articles: Article[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  features = [
    {
      title: 'Organes de qualité',
      description: 'Sélection rigoureuse de donneurs en parfaite santé'
    },
    {
      title: 'Livraison rapide',
      description: 'Livraison discrète garantie !'
    },
    {
      title: 'Transactions sécurisées',
      description: 'Paiement crypté et anonymat total.'
    },
    {
      title: 'Satisfaction client',
      description: 'Plus de 1000 clients satisfaits'
    }
  ];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadArticles(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getAllArticles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.articles = data.slice(0, 6); // Limiter à 6 articles pour la page d'accueil
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des articles';
          console.error(err);
          this.loading = false;
        }
      });
  }

  navigateToArticles(): void {
    this.router.navigate(['/articles']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }
}
