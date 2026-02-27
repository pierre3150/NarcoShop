import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-manage-body-parts',
  templateUrl: './manage-body-parts.component.html',
  styleUrls: ['./manage-body-parts.component.css']
})
export class ManageBodyPartsComponent implements OnInit {
  bodyParts: any[] = [];
  showAddModal = false;
  showEditModal = false;
  saving = false;

  currentBodyPart: any = {
    nameBodyPart: ''
  };

  articles: any[] = [];
  selectedBodyPartForArticles: any = null;
  showAddArticleModal = false;
  showEditArticleModal = false;
  savingArticle = false;

  currentArticle: any = {
    etat: 'PARFAIT',
    prix: 0,
    description: '',
    dateExtraction: '',
    idBodyPart: null
  };

  successMessage = '';
  errorMessage = '';

  readonly etats = ['PARFAIT', 'BON', 'MOYEN', 'MAUVAIS'];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadBodyParts();
  }

  loadBodyParts(): void {
    this.apiService.getAllBodyParts().subscribe({
      next: (bodyParts) => { this.bodyParts = bodyParts; },
      error: (err) => {
        console.error('Erreur chargement parties du corps:', err);
        this.errorMessage = 'Erreur lors du chargement';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

addBodyPart(): void {
    if (!this.currentBodyPart.nameBodyPart.trim()) {
      this.errorMessage = 'Le nom est requis';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.saving = true;
    this.apiService.createBodyPart(this.currentBodyPart).subscribe({
      next: () => {
        this.successMessage = 'Partie du corps ajoutée avec succès !';
        this.loadBodyParts();
        this.closeModal();
        this.saving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout';
        this.saving = false;
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  editBodyPart(bodyPart: any): void {
    this.currentBodyPart = { ...bodyPart };
    this.showEditModal = true;
  }

  updateBodyPart(): void {
    if (!this.currentBodyPart.nameBodyPart.trim()) {
      this.errorMessage = 'Le nom est requis';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.saving = true;
    this.apiService.updateBodyPart(this.currentBodyPart.id, this.currentBodyPart).subscribe({
      next: () => {
        this.successMessage = 'Partie du corps modifiée avec succès !';
        this.loadBodyParts();
        this.closeModal();
        this.saving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.errorMessage = 'Erreur lors de la modification';
        this.saving = false;
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  deleteBodyPart(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette partie du corps ?')) return;
    this.apiService.deleteBodyPart(id).subscribe({
      next: () => {
        this.successMessage = 'Partie du corps supprimée avec succès !';
        this.loadBodyParts();
        if (this.selectedBodyPartForArticles?.id === id) {
          this.selectedBodyPartForArticles = null;
          this.articles = [];
        }
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.errorMessage = 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.currentBodyPart = { nameBodyPart: '' };
  }

private reloadArticles(): void {
    if (!this.selectedBodyPartForArticles) return;
    this.apiService.getArticlesByBodyPartId(this.selectedBodyPartForArticles.id).subscribe({
      next: (articles) => { this.articles = articles; },
      error: (err) => console.error('Erreur rechargement articles:', err)
    });
  }

  toggleArticles(bodyPart: any): void {

    if (this.selectedBodyPartForArticles?.id === bodyPart.id) {
      this.selectedBodyPartForArticles = null;
      this.articles = [];
      return;
    }

    this.selectedBodyPartForArticles = bodyPart;
    this.apiService.getArticlesByBodyPartId(bodyPart.id).subscribe({
      next: (articles) => { this.articles = articles; },
      error: (err) => {
        console.error('Erreur chargement articles:', err);
        this.errorMessage = 'Erreur lors du chargement des articles';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  openAddArticleModal(): void {
    this.currentArticle = {
      etat: 'PARFAIT',
      prix: 0,
      description: '',
      dateExtraction: '',
      idBodyPart: { id: this.selectedBodyPartForArticles.id }
    };
    this.showAddArticleModal = true;
  }

  private buildArticlePayload(): any {
    return {
      etat: this.currentArticle.etat,
      prix: Number(this.currentArticle.prix),
      description: this.currentArticle.description || null,
      dateExtraction: this.currentArticle.dateExtraction
        ? new Date(this.currentArticle.dateExtraction).toISOString()
        : null,
      disponible: true,
      idBodyPart: { id: this.currentArticle.idBodyPart?.id }
    };
  }

  addArticle(): void {
    if (!this.currentArticle.prix || this.currentArticle.prix <= 0) {
      this.errorMessage = 'Le prix doit être supérieur à 0';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.savingArticle = true;
    this.apiService.createArticle(this.buildArticlePayload()).subscribe({
      next: () => {
        this.successMessage = 'Article ajouté avec succès !';
        this.reloadArticles();
        this.closeArticleModal();
        this.savingArticle = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout de l\'article';
        this.savingArticle = false;
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  editArticle(article: any): void {
    this.currentArticle = {
      ...article,
      idBodyPart: { id: article.idBodyPart?.id },
      dateExtraction: article.dateExtraction
        ? new Date(article.dateExtraction).toISOString().substring(0, 10)
        : ''
    };
    this.showEditArticleModal = true;
  }

  updateArticle(): void {
    if (!this.currentArticle.prix || this.currentArticle.prix <= 0) {
      this.errorMessage = 'Le prix doit être supérieur à 0';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.savingArticle = true;
    this.apiService.updateArticle(this.currentArticle.id, this.buildArticlePayload()).subscribe({
      next: () => {
        this.successMessage = 'Article modifié avec succès !';
        this.reloadArticles();
        this.closeArticleModal();
        this.savingArticle = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.errorMessage = 'Erreur lors de la modification';
        this.savingArticle = false;
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  deleteArticle(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    this.apiService.deleteArticle(id).subscribe({
      next: () => {
        this.successMessage = 'Article supprimé avec succès !';
        this.reloadArticles();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.errorMessage = 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  closeArticleModal(): void {
    this.showAddArticleModal = false;
    this.showEditArticleModal = false;
    this.currentArticle = { etat: 'PARFAIT', prix: 0, description: '', dateExtraction: '', idBodyPart: null };
  }
}
