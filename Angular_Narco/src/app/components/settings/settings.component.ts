import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PaymentService, PaymentCard } from '../../services/payment.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  activeTab = 'profile';

  profileData: any = {
    adresse: '',
    password: ''
  };
  loading = false;
  successMessage = '';
  errorMessage = '';

  userCards: PaymentCard[] = [];
  newCard: PaymentCard = {
    codeCb: 0,
    ccv: 0,
    expiryDate: ''
  };
  cardNumberFormatted = '';
  ccvFormatted = '';
  showAddCardForm = false;
  cardLoading = false;
  cardSuccessMessage = '';
  cardErrorMessage = '';

  allUsers: User[] = [];
  allUsersCards: Map<number, PaymentCard[]> = new Map();
  adminLoading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.isAdmin = this.currentUser.role === 'ADMIN';
    this.loadUserData();
    this.loadUserCards();
  }

  loadUserData(): void {
    this.userService.getUserById(this.currentUser.id).subscribe({
      next: (data) => {
        this.profileData.adresse = data.adresse || '';
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
      }
    });
  }

  loadUserCards(): void {
    this.paymentService.getCardsByUserId(this.currentUser.id).subscribe({
      next: (cards) => {
        this.userCards = cards;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des cartes:', err);
      }
    });
  }

  updateProfile(): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updates: any = {
      adresse: this.profileData.adresse
    };

    if (this.profileData.password) {
      updates.password = this.profileData.password;
    }

    this.userService.updateUser(this.currentUser.id, updates).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Profil mis à jour !';
        this.loading = false;
        this.profileData.password = '';

        this.currentUser.adresse = response.adresse;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    });
  }

  toggleAddCardForm(): void {
    this.showAddCardForm = !this.showAddCardForm;
    if (this.showAddCardForm) {
      this.newCard = {
        codeCb: 0,
        ccv: 0,
        expiryDate: ''
      };
      this.cardNumberFormatted = '';
      this.ccvFormatted = '';
    }
  }

formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, ''); // Enlever les espaces
    value = value.replace(/\D/g, ''); // Garder uniquement les chiffres

    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    this.cardNumberFormatted = formatted;

    this.newCard.codeCb = parseInt(value) || 0;
  }

formatCCV(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Garder uniquement les chiffres

    if (value.length > 3) {
      value = value.substring(0, 3);
    }

    this.ccvFormatted = value;
    this.newCard.ccv = parseInt(value) || 0;
  }

formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Garder uniquement les chiffres

    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }

    this.newCard.expiryDate = value;
  }

  addCard(): void {
    this.cardLoading = true;
    this.cardSuccessMessage = '';
    this.cardErrorMessage = '';

    const cardData = {
      ...this.newCard,
      userId: this.currentUser.id
    };

    this.paymentService.addCard(cardData).subscribe({
      next: (response) => {
        this.cardSuccessMessage = 'Carte ajoutée avec succès !';
        this.cardLoading = false;
        this.showAddCardForm = false;
        this.loadUserCards();
      },
      error: (err) => {
        this.cardErrorMessage = err.error?.message || 'Erreur lors de l\'ajout';
        this.cardLoading = false;
      }
    });
  }

  deleteCard(cardId: number | undefined): void {
    if (!cardId) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    this.paymentService.deleteCard(cardId).subscribe({
      next: () => {
        this.userCards = this.userCards.filter(c => c.id !== cardId);
        this.cardSuccessMessage = 'Carte supprimée avec succès';
      },
      error: (err) => {
        this.cardErrorMessage = 'Erreur lors de la suppression';
      }
    });
  }

  loadAllUsers(): void {
    if (!this.isAdmin) return;

    this.adminLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.loadAllUsersCards();
        this.adminLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.adminLoading = false;
      }
    });
  }

  loadAllUsersCards(): void {
    this.paymentService.getAllCards().subscribe({
      next: (cards) => {
        this.allUsersCards.clear();
        cards.forEach(card => {
          if (card.userId) {
            if (!this.allUsersCards.has(card.userId)) {
              this.allUsersCards.set(card.userId, []);
            }
            this.allUsersCards.get(card.userId)?.push(card);
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des cartes:', err);
      }
    });
  }

  getUserCards(userId: number | undefined): PaymentCard[] {
    if (!userId) return [];
    return this.allUsersCards.get(userId) || [];
  }

  deleteUser(userId: number | undefined): void {
    if (!userId) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.allUsers = this.allUsers.filter(u => u.id !== userId);
        alert('Utilisateur supprimé avec succès');
      },
      error: (err) => {
        alert('Erreur lors de la suppression: ' + (err.error?.message || 'Erreur inconnue'));
      }
    });
  }

  maskCardNumber(cardNumber: number): string {
    const cardStr = cardNumber.toString();
    if (cardStr.length < 4) return '****';
    return '**** **** **** ' + cardStr.slice(-4);
  }

  maskCCV(ccv: number): string {
    return '***';
  }
}
