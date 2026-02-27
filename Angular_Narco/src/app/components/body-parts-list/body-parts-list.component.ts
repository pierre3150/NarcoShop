import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BodyPart } from '../../models/body-part.model';

@Component({
  selector: 'app-body-parts-list',
  templateUrl: './body-parts-list.component.html',
  styleUrls: ['./body-parts-list.component.css']
})
export class BodyPartsListComponent implements OnInit {
  bodyParts: BodyPart[] = [];
  filteredBodyParts: BodyPart[] = [];
  articlesCountMap: Map<number, number> = new Map();

  searchTerm: string = '';
  sortBy: string = 'name-asc';
  loading: boolean = false;
  error: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBodyParts();
  }

  loadBodyParts(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getAllBodyParts().subscribe({
      next: (data: BodyPart[]) => {
        console.log('✅ Parties du corps chargées:', data);
        this.bodyParts = data;
        this.filteredBodyParts = [...data];
        this.sortBodyParts();
        this.loadArticlesCounts();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur lors du chargement:', err);
        this.error = 'Impossible de charger les parties du corps';
        this.loading = false;
      }
    });
  }

  loadArticlesCounts(): void {
    this.bodyParts.forEach(bodyPart => {
      if (bodyPart.id) {
        this.apiService.getArticlesByBodyPartId(bodyPart.id).subscribe({
          next: (articles) => {
            this.articlesCountMap.set(bodyPart.id!, articles.length);
          },
          error: () => {
            this.articlesCountMap.set(bodyPart.id!, 0);
          }
        });
      }
    });
  }

  filterBodyParts(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredBodyParts = [...this.bodyParts];
    } else {
      this.filteredBodyParts = this.bodyParts.filter(bp => {
        const name = bp.nameBodyPart || bp.name || '';
        return name.toLowerCase().includes(term);
      });
    }

    this.sortBodyParts();
  }

  sortBodyParts(): void {
    switch (this.sortBy) {
      case 'name-asc':
        this.filteredBodyParts.sort((a, b) => {
          const nameA = a.nameBodyPart || a.name || '';
          const nameB = b.nameBodyPart || b.name || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'name-desc':
        this.filteredBodyParts.sort((a, b) => {
          const nameA = a.nameBodyPart || a.name || '';
          const nameB = b.nameBodyPart || b.name || '';
          return nameB.localeCompare(nameA);
        });
        break;
      case 'articles-desc':
        this.filteredBodyParts.sort((a, b) =>
          this.getArticlesCount(b.id!) - this.getArticlesCount(a.id!)
        );
        break;
      case 'articles-asc':
        this.filteredBodyParts.sort((a, b) =>
          this.getArticlesCount(a.id!) - this.getArticlesCount(b.id!)
        );
        break;
    }
  }

  getArticlesCount(bodyPartId: number): number {
    return this.articlesCountMap.get(bodyPartId) || 0;
  }

  viewBodyPartDetails(bodyPartId: number): void {
    console.log('📄 Voir la partie:', bodyPartId);
    this.router.navigate(['/body-part', bodyPartId]);
  }
}
