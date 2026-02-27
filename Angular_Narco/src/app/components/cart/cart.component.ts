import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService, Cart } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  currentUser: any = null;
  isLoggedIn = false;
  cart: Cart | null = null;
  loading = false;
  checkoutLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = !!this.currentUser;

    if (this.isLoggedIn) {
      this.loadCart();
    }
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getUserCart(this.currentUser.id).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du panier:', err);
        this.errorMessage = 'Impossible de charger le panier';
        this.loading = false;
      }
    });
  }

  removeItem(bodyPartId: number): void {
    if (!this.cart || !confirm('Êtes-vous sûr de vouloir retirer cet article ?')) {
      return;
    }

    this.cartService.removeFromCart(this.cart.cartId, bodyPartId).subscribe({
      next: () => {
        this.successMessage = 'Article retiré du panier';
        this.loadCart();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  clearCart(): void {
    if (!this.cart || !confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      return;
    }

    this.cartService.clearCart(this.cart.cartId).subscribe({
      next: () => {
        this.successMessage = 'Panier vidé avec succès';
        this.loadCart();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du vidage du panier';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  checkout(): void {
    if (!this.cart) return;

    this.checkoutLoading = true;
    this.cartService.checkout(this.cart.cartId).subscribe({
      next: (response) => {
        this.successMessage = '🎉 Commande validée ! Votre rein sera livré sous 24h... 😄';
        this.checkoutLoading = false;

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la validation';
        this.checkoutLoading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getStateLabel(state: string): string {
    const states: {[key: string]: string} = {
      'FRESH': 'Frais',
      'FROZEN': 'Congelé',
      'PRESERVED': 'Conservé',
      'DAMAGED': 'Abîmé'
    };
    return states[state] || state;
  }
}
