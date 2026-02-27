import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BodyMapComponent } from './components/body-map/body-map.component';
import { ArticlesListComponent } from './components/articles-list/articles-list.component';
import { BodyPartsListComponent } from './components/body-parts-list/body-parts-list.component';
import { PolicyComponent } from './components/policy/policy.component';
import { AuthComponent } from './components/auth/auth.component';
import { SettingsComponent } from './components/settings/settings.component';
import { CartComponent } from './components/cart/cart.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ManageBodyPartsComponent } from './components/manage-body-parts/manage-body-parts.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'body-map', component: BodyMapComponent },
  { path: 'articles', component: ArticlesListComponent },
  { path: 'article/:id', component: ArticleDetailComponent },
  { path: 'body-parts', component: BodyPartsListComponent },
  { path: 'manage-body-parts', component: ManageBodyPartsComponent },
  { path: 'policy', component: PolicyComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrderHistoryComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'login', redirectTo: 'auth' },
  { path: 'register', redirectTo: 'auth' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
