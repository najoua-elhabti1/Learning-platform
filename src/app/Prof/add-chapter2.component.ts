import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProfService } from '../services/prof.service';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { ProfMenuComponent } from './prof-menu/prof-menu.component';
import { RouterOutlet } from '@angular/router';
import { StudentComponent } from '../Student/student.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-add-chapter',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MenuComponent,
    ProfMenuComponent,
    RouterOutlet,
    StudentComponent,
    ReactiveFormsModule,
  ],
  template: `
    <app-header></app-header>
   <app-prof-menu></app-prof-menu>
    <div class="container">
      <form [formGroup]="chapterForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="courseName">Nom du cours</label>
          <select
            id="courseName"
            formControlName="courseName"
            class="form-control"
          >
            <option value="" disabled>Sélectionner un cours</option>
            <option *ngFor="let course of courses$ | async" [value]="course">{{ course }}</option>
          </select>
          <div *ngIf="chapterForm.controls['courseName'].invalid && chapterForm.controls['courseName'].touched" class="error">
            Le nom du cours est requis.
          </div>
        </div>

        <div class="form-group">
          <label for="chapterName">Nom du chapitre</label>
          <input
            type="text"
            id="chapterName"
            formControlName="chapterName"
            class="form-control"
            placeholder="Entrez le nom du chapitre"
          />
          <div *ngIf="chapterForm.controls['chapterName'].invalid && chapterForm.controls['chapterName'].touched" class="error">
            Le nom du chapitre est requis.
          </div>
        </div>

        <div class="form-group">
          <label for="uploadChapter">Télécharger le chapitre</label>
          <input
            type="file"
            id="uploadChapter"
            (change)="onFileChange($event)"
            class="form-control"
          />
          <div *ngIf="!selectedFile && chapterForm.controls['uploadChapter'].touched" class="error">
            Le fichier du chapitre est requis.
          </div>
        </div>

        <div class="form-group form-check">
          <input
            type="checkbox"
            id="isVisible"
            formControlName="isVisible"
            class="form-check-input"
          />
          <label for="isVisible" class="form-check-label">Visible</label>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="chapterForm.invalid">Ajouter le chapitre</button>

        <div *ngIf="errorMessage" class="error mt-2">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 50px auto; /* Ajout de l'espace en haut */
      padding: 20px;
      background-color: #007bff; /* Couleur bleu personnalisé */
      border-radius: 10px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      color: white; /* Texte en blanc pour contraste */
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-control {
      border-radius: 5px;
      color: black; /* Changer la couleur du texte des inputs */
    }

    .form-control::placeholder {
      color: #d1e7fd; /* Placeholder en bleu clair */
    }

    .form-check-input {
      margin-left: 0.25rem;
    }

    .btn {
      margin-top: 20px;
      background-color: #0056b3; /* Un bleu plus sombre pour le bouton */
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 1rem;
    }

    .btn:disabled {
      background-color: #b0b0b0;
    }

    .btn-primary:hover {
      background-color: #003d82; /* Un bleu encore plus sombre pour le hover */
    }

    .error {
      color: #ffcccb; /* Rouge clair pour les erreurs */
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .error.mt-2 {
      margin-top: 20px;
      color: #ffb3b3;
      font-weight: bold;
    }
  `]
})
export class AddChapterComponent implements OnInit {
  chapterForm: FormGroup;
  courses$: Observable<string[]> = of([]); // Initialiser avec une valeur par défaut
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private profService: ProfService) {
    this.chapterForm = this.fb.group({
      courseName: ['', Validators.required],
      chapterName: ['', Validators.required],
      uploadChapter: [null, Validators.required],
      isVisible: [false]
    });
  }

  ngOnInit(): void {
    // Récupérer la liste des cours
    this.courses$ = this.profService.getCourses().pipe(
      map(courses => courses.map(course => course.courseName)),
      catchError(error => {
        console.error('Erreur lors de la récupération des cours:', error);
        return of([]);
      })
    );
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Déclenche une validation du fichier sélectionné
      this.chapterForm.patchValue({
        uploadChapter: this.selectedFile
      });
    }
  }

  onSubmit(): void {
    if (this.chapterForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('courseName', this.chapterForm.get('courseName')?.value);
      formData.append('chapter', this.chapterForm.get('chapterName')?.value);
      formData.append('isVisible', this.chapterForm.get('isVisible')?.value);
      formData.append('file', this.selectedFile);

      this.profService.uploadChapter(formData).pipe(
        map(response => {
          this.errorMessage = null;
          alert('Chapitre ajouté avec succès!');
        }),
        catchError(err => {
          this.errorMessage = 'Erreur lors de l\'ajout du chapitre.';
          return of(null);
        })
      ).subscribe();
    }
  }
}
