/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfService } from '../services/prof.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ProfMenuComponent } from './prof-menu/prof-menu.component';
import { RouterOutlet } from '@angular/router';
import { StudentComponent } from '../Student/student.component';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-course-input',
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
    <div class="max-w-lg mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg mb-8">
      <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Ajouter un Cours</h2>
      <form [formGroup]="courseForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="courseName" class="block text-gray-700 font-medium mb-2">Nom du cours</label>
          <input
            type="text"
            id="courseName"
            formControlName="courseName"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez le nom du cours"
          />
          <div *ngIf="courseForm.controls['courseName'].invalid && courseForm.controls['courseName'].touched" class="text-red-500 text-sm mt-2">
            Le nom du cours est requis.
          </div>
        </div>

        <div class="mb-6">
          <label for="level" class="block text-gray-700 font-medium mb-2">Niveau</label>
          <input
            type="number"
            id="level"
            formControlName="level"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez le niveau"
          />
          <div *ngIf="courseForm.controls['level'].invalid && courseForm.controls['level'].touched" class="text-red-500 text-sm mt-2">
            Le niveau est requis et doit être un nombre.
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          [disabled]="courseForm.invalid"
        >
          Ajouter le cours
        </button>
      </form>
    </div>
    <app-footer></app-footer>
  `,
  styles: []
})
export class CourseInputComponent {
  courseForm: FormGroup;
  uploadStatus: string = '';
  
  constructor(private fb: FormBuilder, private profService: ProfService) {
    this.courseForm = this.fb.group({
      courseName: ['', Validators.required],
      level: ['', [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const { courseName, level } = this.courseForm.value;

      this.profService.createCourse(courseName, level).subscribe(
        (response) => {
          console.log('Cours ajouté avec succès:', response);
          alert('Cours ajouté avec succès!');
          this.courseForm.reset();
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du cours:', error);
        }
      );
    }
  }
}
