import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  activeTab = 'stats';

  stats: any = null;
  pendingOrders = 0;

  orders: any[] = [];
  filteredOrders: any[] = [];
  filterStatus = '';

  users: any[] = [];

  showCardsModal = false;
  selectedUserCards: any[] = [];

  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';

    if (this.isAdmin) {
      this.loadStats();
      this.loadOrders();
      this.loadUsers();
    }
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.pendingOrders = stats.ordersByStatus?.PENDING || 0;
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  loadOrders(): void {
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
      },
      error: (err) => {
        console.error('Erreur chargement commandes:', err);
        this.errorMessage = 'Erreur lors du chargement des commandes';
      }
    });
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs:', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
      }
    });
  }

  filterOrders(): void {
    if (this.filterStatus === '') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.filterStatus);
    }
  }

  updateStatus(orderId: number, newStatus: string): void {
    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.successMessage = `Statut mis à jour: ${this.getStatusLabel(newStatus)}`;
        this.loadStats(); // Recharger les stats
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour du statut';
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  viewUserCards(userId: number): void {
    this.adminService.getUserCards(userId).subscribe({
      next: (cards) => {
        this.selectedUserCards = cards;
        this.showCardsModal = true;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des cartes';
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Erreur:', err);
      }
    });
  }

  closeCardsModal(): void {
    this.showCardsModal = false;
    this.selectedUserCards = [];
  }

  viewOrderDetails(order: any): void {
    this.successMessage = `Détails de la commande #${order.orderId}`;
    setTimeout(() => this.successMessage = '', 3000);
  }

  viewUserOrders(userId: number): void {
    this.activeTab = 'orders';
    this.filterStatus = '';
    this.filteredOrders = this.orders.filter(order => order.userId === userId);
  }

  maskCardNumber(cardNumber: number | string): string {
    const str = cardNumber.toString();
    if (str.length < 4) return str;
    const lastFour = str.slice(-4);
    return `**** **** **** ${lastFour}`;
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'PENDING': '⏳ En attente',
      'PREPARING': '🔧 En préparation',
      'DELIVERED': '🚚 Livré',
      'COMPLETED': '✅ Opération terminée'
    };
    return labels[status] || status;
  }

  goToManageBodyParts(): void {
    this.router.navigate(['/manage-body-parts']);
  }
}
