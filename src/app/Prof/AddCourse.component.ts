import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfService } from '../services/prof.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { ProfMenuComponent } from './prof-menu/prof-menu.component';
import { RouterOutlet } from '@angular/router';
import { StudentComponent } from '../Student/student.component';

@Component({
  selector: 'app-course-input',
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

      <form [formGroup]="courseForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="courseName">Nom du cours</label>
          <input
            type="text"
            id="courseName"
            formControlName="courseName"
            class="form-control"
            placeholder="Entrez le nom du cours"
          />
          <div *ngIf="courseForm.controls['courseName'].invalid && courseForm.controls['courseName'].touched" class="error">
            Le nom du cours est requis.
          </div>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="courseForm.invalid">Ajouter le cours</button>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 30px;
      background-color: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #343a40;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-control {
      border-radius: 5px;
      border: 1px solid #ced4da;
      padding: 10px;
      font-size: 1rem;
    }

    .form-control:focus {
      border-color: #80bdff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }

    .btn {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      border-radius: 5px;
      background-color: #007bff;
      border: none;
      color: white;
      transition: background-color 0.3s;
    }

    .btn:hover {
      background-color: #0056b3;
    }

    .error {
      color: red;
      font-size: 0.875rem;
      margin-top: 5px;
    }
  `]
})
export class CourseInputComponent {
  courseForm: FormGroup;

  constructor(private fb: FormBuilder, private profService: ProfService) {
    this.courseForm = this.fb.group({
      courseName: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const courseName = this.courseForm.value.courseName;
      this.profService.createCourse(courseName).subscribe(
        response => {
          console.log('Cours ajouté avec succès:', response);
          this.courseForm.reset();
        },
        error => {
          console.error('Erreur lors de l\'ajout du cours:', error);
        }
      );
    }
  }
}
