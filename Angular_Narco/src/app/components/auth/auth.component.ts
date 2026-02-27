import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isRegisterMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  loginCredentials: UserCredentials = {
    username: '',
    password: ''
  };

  registerCredentials: UserCredentials = {
    username: '',
    password: '',
    adresse: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

onLogin(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginCredentials).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie:', response);
        this.successMessage = response.message;
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        console.error('❌ Erreur de connexion:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la connexion';
        this.loading = false;
      }
    });
  }

onRegister(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerCredentials).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie:', response);
        this.successMessage = response.message + ' Redirection...';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur d\'inscription:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
