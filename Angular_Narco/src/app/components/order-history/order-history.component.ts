import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  currentUser: any = null;
  isLoggedIn = false;
  orders: any[] = [];
  loading = false;
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
      this.loadOrderHistory();
    }
  }

  loadOrderHistory(): void {
    this.loading = true;
    this.cartService.getOrderHistory(this.currentUser.id).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'historique:', err);
        this.errorMessage = 'Impossible de charger l\'historique';
        this.loading = false;
      }
    });
  }

  getTotalSpent(): string {
    const total = this.orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
    return total.toFixed(2);
  }

  getTotalItems(): number {
    return this.orders.reduce((sum, order) => sum + (order.itemCount || 0), 0);
  }

  viewOrderDetails(orderId: number): void {
    this.successMessage = `Détails de la commande #${orderId} (à implémenter)`;
    setTimeout(() => this.successMessage = '', 3000);
  }

  reorderItems(order: any): void {

    let addedCount = 0;
    let errorCount = 0;

    order.items.forEach((item: any, index: number) => {
      setTimeout(() => {
        this.cartService.addToCart(this.currentUser.id, item.articleId).subscribe({
          next: () => {
            addedCount++;
            if (index === order.items.length - 1) {
              this.showReorderResult(addedCount, errorCount);
            }
          },
          error: () => {
            errorCount++;
            if (index === order.items.length - 1) {
              this.showReorderResult(addedCount, errorCount);
            }
          }
        });
      }, index * 200); // Délai entre chaque ajout
    });
  }

  private showReorderResult(added: number, errors: number): void {
    if (errors === 0) {
      this.successMessage = `✅ ${added} article(s) ajouté(s) au panier !`;

      this.cartService.getUserCart(this.currentUser.id).subscribe({
        next: (cart) => {
          this.cartService.updateCartCount(cart.itemCount);
        }
      });
    } else {
      this.errorMessage = `⚠️ ${added} article(s) ajouté(s), ${errors} erreur(s)`;
    }
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  getStateLabel(state: string): string {
    const states: {[key: string]: string} = {
      'FRESH': '🟢 Frais',
      'FROZEN': '🔵 Congelé',
      'PRESERVED': '🟡 Conservé',
      'DAMAGED': '🔴 Abîmé',
      'Excellent': '🟢 Excellent',
      'Bon': '🟡 Bon',
      'Moyen': '🟠 Moyen',
      'Neuf': '✨ Neuf'
    };
    return states[state] || state;
  }

  getStateClass(state: string): string {
    const classes: {[key: string]: string} = {
      'FRESH': 'fresh',
      'FROZEN': 'frozen',
      'PRESERVED': 'preserved',
      'DAMAGED': 'damaged',
      'Excellent': 'fresh',
      'Bon': 'preserved',
      'Moyen': 'damaged',
      'Neuf': 'fresh'
    };
    return classes[state] || '';
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'PENDING': '⏳ En attente',
      'PREPARING': '🔧 En préparation',
      'DELIVERED': '🚚 Livré',
      'COMPLETED': '✅ Opération terminée'
    };
    return labels[status] || '⏳ En attente';
  }
}
