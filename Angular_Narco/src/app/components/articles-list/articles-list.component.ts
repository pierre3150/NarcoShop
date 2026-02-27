import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.css']
})
export class ArticlesListComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];

  searchTerm: string = '';
  sortBy: string = 'price-asc';
  filterEtat: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllArticles();
  }

  loadAllArticles(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getAllArticles().subscribe({
      next: (data) => {
        console.log('✅ Articles chargés:', data);
        this.articles = data;
        this.filteredArticles = [...data];
        this.sortArticles();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des articles:', err);
        this.error = 'Impossible de charger les articles';
        this.loading = false;
      }
    });
  }

  filterArticles(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredArticles = this.articles.filter(article => {
      const matchesSearch = !term ||
        (article.description?.toLowerCase().includes(term)) ||
        (article.etat?.toLowerCase().includes(term)) ||
        (this.getBodyPartName(article).toLowerCase().includes(term)) ||
        (article.id?.toString().includes(term));

      const matchesEtat = !this.filterEtat || article.etat === this.filterEtat;

      return matchesSearch && matchesEtat;
    });

    this.sortArticles();
  }

  sortArticles(): void {
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredArticles.sort((a, b) => (a.prix || 0) - (b.prix || 0));
        break;
      case 'price-desc':
        this.filteredArticles.sort((a, b) => (b.prix || 0) - (a.prix || 0));
        break;
      case 'date-desc':
        this.filteredArticles.sort((a, b) => {
          const dateA = a.dateExtraction ? new Date(a.dateExtraction).getTime() : 0;
          const dateB = b.dateExtraction ? new Date(b.dateExtraction).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'date-asc':
        this.filteredArticles.sort((a, b) => {
          const dateA = a.dateExtraction ? new Date(a.dateExtraction).getTime() : 0;
          const dateB = b.dateExtraction ? new Date(b.dateExtraction).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'bodypart-asc':
        this.filteredArticles.sort((a, b) =>
          this.getBodyPartName(a).localeCompare(this.getBodyPartName(b))
        );
        break;
    }
  }

  getBodyPartName(article: Article): string {
    return article.idBodyPart?.nameBodyPart || article.idBodyPart?.name || 'Non spécifié';
  }

  getEtatClass(etat: string | undefined): string {
    switch (etat?.toLowerCase()) {
      case 'excellent':
      case 'neuf':
        return 'etat-excellent';
      case 'bon':
        return 'etat-bon';
      case 'moyen':
        return 'etat-moyen';
      default:
        return 'etat-default';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewArticleDetails(articleId: number): void {
    console.log('📄 Voir l\'article:', articleId);
    this.router.navigate(['/article', articleId]);
  }
}
