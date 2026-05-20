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

  profileData = { adresse: '', password: '' };
  loading = false;
  successMessage = '';
  errorMessage = '';

  userCards: PaymentCard[] = [];
  newCard: PaymentCard = { codeCb: 0, ccv: 0, expiryDate: '' };
  cardNumberFormatted = '';
  ccvFormatted = '';
  showAddCardForm = false;
  cardLoading = false;
  cardSuccessMessage = '';
  cardErrorMessage = '';

  allUsers: User[] = [];
  allUsersCards: Record<number, PaymentCard[]> = {};
  adminLoading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

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
      next: (data) => { this.profileData.adresse = data.adresse || ''; },
      error: (err) => console.error('Erreur chargement profil:', err)
    });
  }

  loadUserCards(): void {
    this.paymentService.getCardsByUserId(this.currentUser.id).subscribe({
      next: (cards) => { this.userCards = cards; },
      error: (err) => console.error('Erreur chargement cartes:', err)
    });
  }

  updateProfile(): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updates: any = { adresse: this.profileData.adresse };
    if (this.profileData.password) {
      updates.password = this.profileData.password;
    }

    this.userService.updateUser(this.currentUser.id, updates).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Profil mis à jour !';
        this.profileData.password = '';
        this.loading = false;
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
      this.newCard = { codeCb: 0, ccv: 0, expiryDate: '' };
      this.cardNumberFormatted = '';
      this.ccvFormatted = '';
    }
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardNumberFormatted = value.match(/.{1,4}/g)?.join(' ') || '';
    this.newCard.codeCb = parseInt(value) || 0;
  }

  formatCCV(event: any): void {
    const value = event.target.value.replace(/\D/g, '').substring(0, 3);
    this.ccvFormatted = value;
    this.newCard.ccv = parseInt(value) || 0;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    this.newCard.expiryDate = value;
  }

  addCard(): void {
    this.cardLoading = true;
    this.cardSuccessMessage = '';
    this.cardErrorMessage = '';

    this.paymentService.addCard({ ...this.newCard, userId: this.currentUser.id }).subscribe({
      next: () => {
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
    if (!cardId || !confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    this.paymentService.deleteCard(cardId).subscribe({
      next: () => {
        this.userCards = this.userCards.filter(c => c.id !== cardId);
        this.cardSuccessMessage = 'Carte supprimée avec succès';
      },
      error: () => { this.cardErrorMessage = 'Erreur lors de la suppression'; }
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
        console.error('Erreur chargement utilisateurs:', err);
        this.adminLoading = false;
      }
    });
  }

  loadAllUsersCards(): void {
    this.paymentService.getAllCards().subscribe({
      next: (cards) => {
        this.allUsersCards = cards.reduce((acc, card) => {
          if (card.userId) {
            acc[card.userId] = [...(acc[card.userId] || []), card];
          }
          return acc;
        }, {} as Record<number, PaymentCard[]>);
      },
      error: (err) => console.error('Erreur chargement cartes admin:', err)
    });
  }

  getUserCards(userId: number | undefined): PaymentCard[] {
    return userId ? (this.allUsersCards[userId] || []) : [];
  }

  deleteUser(userId: number | undefined): void {
    if (!userId || !confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => { this.allUsers = this.allUsers.filter(u => u.id !== userId); },
      error: (err) => alert('Erreur lors de la suppression: ' + (err.error?.message || 'Erreur inconnue'))
    });
  }

  deleteMyAccount(): void {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer définitivement votre compte ?\n\nCette action est irréversible. Toutes vos données seront supprimées.')) return;

    const confirmation = prompt('Pour confirmer, tapez votre nom d\'utilisateur : "' + this.currentUser.username + '"');
    if (confirmation !== this.currentUser.username) {
      alert('Nom d\'utilisateur incorrect. Suppression annulée.');
      return;
    }

    this.userService.deleteUser(this.currentUser.id).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/auth']);
      },
      error: (err) => alert('Erreur lors de la suppression : ' + (err.error?.message || 'Erreur inconnue'))
    });
  }

  maskCardNumber(cardNumber: number): string {
    const s = cardNumber.toString();
    return s.length < 4 ? '****' : '**** **** **** ' + s.slice(-4);
  }

  maskCCV(): string {
    return '***';
  }
}
