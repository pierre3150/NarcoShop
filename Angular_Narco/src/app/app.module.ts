import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { BodyMapComponent } from './components/body-map/body-map.component';
import { ArticlesListComponent } from './components/articles-list/articles-list.component';
import { BodyPartsListComponent } from './components/body-parts-list/body-parts-list.component';
import { PolicyComponent } from './components/policy/policy.component';
import { AuthComponent } from './components/auth/auth.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsComponent } from './components/settings/settings.component';
import { CartComponent } from './components/cart/cart.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ManageBodyPartsComponent } from './components/manage-body-parts/manage-body-parts.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BodyMapComponent,
    ArticlesListComponent,
    BodyPartsListComponent,
    PolicyComponent,
    AuthComponent,
    NavbarComponent,
    SettingsComponent,
    CartComponent,
    ArticleDetailComponent,
    OrderHistoryComponent,
    AdminDashboardComponent,
    ManageBodyPartsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
