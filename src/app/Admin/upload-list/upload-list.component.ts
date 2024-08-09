import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { MenuComponent } from '../../menu/menu.component';
import { AdminMenuComponent } from "../admin-menu/admin-menu.component";
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-upload-list',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, MenuComponent, AdminMenuComponent, FooterComponent],
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css']
})
export class UploadListComponent {
  selectedChoice: string | null = null;
  selectedFile: File | null = null;
  uploadStatus: string = '';
  sendEmailStatus: string = '';
  authService = inject(AuthService);

  constructor(private http: HttpClient) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }



  clearDatabase() {
    this.authService.clearDatabase().subscribe(
      (response: any) => {
        alert('Base de données vidée avec succès.');
      },
      (error: any) => {
        alert("Échec de la suppression de la base de données.");
      }
    );
  }
  onSubmit() {
    if (this.selectedFile) {
      this.authService.uploadFile(this.selectedFile).subscribe(
        () => {
          this.uploadStatus = 'Fichier téléchargé avec succès !';
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur de téléchargement :', error);
          if (error.status === 401) {
            this.uploadStatus = 'Non autorisé. Veuillez vous reconnecter.';
          } else {
            this.uploadStatus = `${error.status} Échec du téléchargement du fichier.`;
          }
        }
      );
    } else {
      this.uploadStatus = 'Choisir un fichier premièrement.';
    }
  }

  sendEmails() {
    this.authService.registerUsers().subscribe(
      () => {
        this.sendEmailStatus = 'Emails sent successfully!';
      },
      (error: HttpErrorResponse) => {
        console.error('Send emails error:', error);
        if (error.status === 401) {
          this.sendEmailStatus = 'Unauthorized. Please login again.';
        } else {
          this.sendEmailStatus = `${error.status} Failed to send emails.`;
        }
      }
    );
  }
  selectChoice(choice: string) {
    this.selectedChoice = choice;
  }
}
