import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { MenuComponent } from '../../menu/menu.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent,MenuComponent,ProfMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  router = inject(Router);


}

