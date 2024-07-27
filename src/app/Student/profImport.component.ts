import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfService } from '..//services/prof.service';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { ProfMenuComponent } from '../Prof/prof-menu/prof-menu.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass and ngIf

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MenuComponent, ProfMenuComponent, RouterOutlet],
  template: `
    <div class="container">
      <h2>Ajouter des Questions depuis un fichier Excel</h2>
      <form>
        <div class="form-group">
          <label for="fileInput">Choisissez un fichier Excel:</label>
          <input
            type="file"
            id="fileInput"
            (change)="onFileSelected($event)"
            class="form-control"
            accept=".xlsx, .xls"
          />
        </div>
        <div *ngIf="isLoading" class="loader"></div>
        <div *ngIf="message" class="alert" [ngClass]="{'alert-success': message.includes('succès'), 'alert-danger': message.includes('Erreur')}">
          {{ message }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      text-align: center;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    input[type="file"] {
      display: block;
      width: 100%;
    }

    .loader {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #007bff;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alert {
      padding: 15px;
      margin-top: 20px;
      border-radius: 5px;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class AddQuestionsComponentN {
  message: string | null = null;
  isLoading: boolean = false;

  constructor(private profService: ProfService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.profService.addQuestionsFromExcel(file).subscribe(
        response => {
          this.message = 'Questions ajoutées avec succès.';
          this.isLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.message = 'Erreur lors de l\'ajout des questions : ' + error.message;
          this.isLoading = false;
        }
      );
    }
  }
}
