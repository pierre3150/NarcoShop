import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: any = null;
  showDropdown = false;
  showMobileMenu = false;
  cartItemCount = 0;

  private userSubscription?: Subscription;
  private cartSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUser = user;

      if (user) {
        this.loadCartCount();
      }
    });

    this.cartSubscription = this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  loadCartCount(): void {
    if (this.currentUser) {
      this.cartService.getUserCart(this.currentUser.id).subscribe({
        next: (cart) => {
          this.cartService.updateCartCount(cart.itemCount);
        },
        error: () => {

        }
      });
    }
  }

  ngOnDestroy(): void {

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
    this.showDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdown();
    this.closeMobileMenu();
    this.router.navigate(['/home']);
  }
}
