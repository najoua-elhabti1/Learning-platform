import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { MenuComponent } from "../menu/menu.component";
import { ProfMenuComponent } from "../Prof/prof-menu/prof-menu.component";
import {Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [HeaderComponent, MenuComponent, ProfMenuComponent, RouterOutlet],
  template: `
    <app-header></app-header>
    <div class="header">

      <nav>
        <ul>
          <li><a (click)="showChapters()">Display All Chapters</a></li>
        </ul>
      </nav>
    </div>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .header {
      background-color: rgba(253, 173, 2, 1);
      padding: 10px;
      border-bottom: 1px solid #e7e7e7;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .header nav ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      display: flex;
      gap: 15px;
    }

    .header nav ul li {
      display: inline;
    }

    .header nav ul li a {
      text-decoration: none;
      color: #007bff;
      cursor: pointer;
    }

    .header nav ul li a:hover {
      text-decoration: underline;
    }

    .content {
      padding: 20px;
    }
  `]
})
export class StudentComponent {
  constructor(private router: Router) {}

  showChapters() {
    this.router.navigate(['/chapters']);
  }
}
