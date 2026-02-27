import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  article: any = null;
  similarArticles: any[] = [];
  loading = true;
  addingToCart = false;
  isLoggedIn = false;
  currentUser: any = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = !!this.currentUser;

    this.route.params.subscribe(params => {
      const articleId = +params['id'];
      if (articleId) {
        this.loadArticle(articleId);
      }
    });
  }

  loadArticle(id: number): void {
    this.loading = true;
    this.apiService.getArticleById(id).subscribe({
      next: (article) => {
        this.article = article;
        this.loading = false;
        this.loadSimilarArticles();
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'article:', err);
        this.article = null;
        this.loading = false;
      }
    });
  }

  loadSimilarArticles(): void {
    if (!this.article || !this.article.idBodyPart) return;

    this.apiService.getAllArticles().subscribe({
      next: (articles) => {
        this.similarArticles = articles
          .filter(a =>
            a.id !== this.article.id &&
            a.idBodyPart?.id === this.article.idBodyPart.id
          )
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des articles similaires:', err);
      }
    });
  }

  addToCart(): void {
    if (!this.isLoggedIn || !this.article) return;

    this.addingToCart = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.cartService.addToCart(this.currentUser.id, this.article.id).subscribe({
      next: (response) => {
        this.successMessage = '✅ Article ajouté au panier !';
        this.addingToCart = false;

        this.cartService.getUserCart(this.currentUser.id).subscribe({
          next: (cart) => {
            this.cartService.updateCartCount(cart.itemCount);
          }
        });

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout au panier';
        this.addingToCart = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  navigateToArticle(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/article', id]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  getStateLabel(state: string): string {
    const states: {[key: string]: string} = {
      'FRESH': '🟢 Frais',
      'FROZEN': '🔵 Congelé',
      'PRESERVED': '🟡 Conservé',
      'DAMAGED': '🔴 Abîmé'
    };
    return states[state] || state;
  }

  getStateClass(state: string): string {
    const classes: {[key: string]: string} = {
      'FRESH': 'fresh',
      'FROZEN': 'frozen',
      'PRESERVED': 'preserved',
      'DAMAGED': 'damaged'
    };
    return classes[state] || '';
  }
}
