import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProfService } from '../services/prof.service';
import { HeaderComponent } from '../header/header.component';
import { ProfMenuComponent } from './prof-menu/prof-menu.component';
import { RouterOutlet } from '@angular/router';
import { StudentComponent } from '../Student/student.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-add-chapter',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ProfMenuComponent,
    RouterOutlet,
    StudentComponent,
    ReactiveFormsModule,
    FooterComponent
],
  template: `
    <app-header></app-header>
    <app-prof-menu></app-prof-menu>
    <div class="container max-w-lg mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg mb-8">
    <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Ajouter un Chapitre</h2>
      <form [formGroup]="chapterForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="courseName" class="block text-gray-700 font-medium mb-2">Nom du cours</label>
          <select
            id="courseName"
            formControlName="courseName"
            class="form-control border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Sélectionner un cours</option>
            <option *ngFor="let course of courses$ | async" [value]="course">{{ course }}</option>
          </select>
          <div *ngIf="chapterForm.controls['courseName'].invalid && chapterForm.controls['courseName'].touched" class="text-red-500 mt-1 text-sm">
            Le nom du cours est requis.
          </div>
        </div>

        <div class="mb-4">
          <label for="chapterName" class="block text-gray-700 font-medium mb-2">Nom du chapitre</label>
          <input
            type="text"
            id="chapterName"
            formControlName="chapterName"
            class="form-control border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez le nom du chapitre"
          />
          <div *ngIf="chapterForm.controls['chapterName'].invalid && chapterForm.controls['chapterName'].touched" class="text-red-500 mt-1 text-sm">
            Le nom du chapitre est requis.
          </div>
        </div>

        <div class="mb-4">
          <label for="uploadChapter" class="block text-gray-700 font-medium mb-2">Télécharger le chapitre</label>
          <input
            type="file"
            id="uploadChapter"
            (change)="onFileChange($event)"
            class="form-control border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div *ngIf="!selectedFile && chapterForm.controls['uploadChapter'].touched" class="text-red-500 mt-1 text-sm">
            Le fichier du chapitre est requis.
          </div>
        </div>

        <div class="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isVisible"
            formControlName="isVisible"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label for="isVisible" class="ml-2 text-gray-700">Visible</label>
        </div>

        <button type="submit" class="btn-primary py-2 px-4 rounded-md text-white font-medium disabled:opacity-50" [disabled]="chapterForm.invalid">Ajouter le chapitre</button>

        <div *ngIf="errorMessage" class="text-red-500 mt-4 font-medium">
          {{ errorMessage }}
        </div>
      </form>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .container {
      max-width: 600px;
    }
    .btn-primary {
      background-color: #0056b3;
      border: none;
      font-size: 1rem;
    }
    .btn-primary:hover {
      background-color: #003d82;
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
