import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfService } from '../services/prof.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { ProfMenuComponent } from './prof-menu/prof-menu.component';
import { RouterOutlet } from '@angular/router';
import { StudentComponent } from '../Student/student.component';

@Component({
  selector: 'app-add-question',
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
    <div class="container">
      <h2>Ajouter une question</h2>

      <form [formGroup]="questionForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="courseName">Nom du cours</label>
          <select
            id="courseName"
            formControlName="courseName"
            class="form-control"
            (change)="onCourseChange($event)"
          >
            <option value="" disabled>Sélectionner un cours</option>
            <option *ngFor="let course of courses$ | async" [value]="course.courseName">{{ course.courseName }}</option>
          </select>
          <div *ngIf="questionForm.controls['courseName'].invalid && questionForm.controls['courseName'].touched" class="error">
            Le nom du cours est requis.
          </div>
        </div>

        <div class="form-group" *ngIf="chapters$ | async as chapters">
          <label for="chapterName">Nom du chapitre</label>
          <select
            id="chapterName"
            formControlName="chapterName"
            class="form-control"
          >
            <option value="" disabled>Sélectionner un chapitre</option>
            <option *ngFor="let chapter of chapters" [value]="chapter">{{ chapter }}</option>
          </select>
          <div *ngIf="questionForm.controls['chapterName'].invalid && questionForm.controls['chapterName'].touched" class="error">
            Le nom du chapitre est requis.
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="questionForm.invalid">Ajouter la question</button>

        <div *ngIf="errorMessage" class="error mt-2">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: auto;
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .btn {
      margin-top: 10px;
    }

    .error {
      color: red;
      font-size: 0.875rem;
    }
  `]
})
export class AddQuestionsComponent2 implements OnInit {
  questionForm: FormGroup;
  courses$: Observable<any[]> = of([]);
  chapters$: Observable<string[]> = of([]);
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private profService: ProfService) {
    this.questionForm = this.fb.group({
      courseName: ['', Validators.required],
      chapterName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Récupérer la liste des cours avec fileDocuments (chapitres)
    this.courses$ = this.profService.getCourses().pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des cours:', error);
        this.errorMessage = "Erreur lors de la récupération des cours.";
        return of([]);
      })
    );

    // Debug: Vérification des données récupérées
    this.courses$.subscribe(courses => {
      console.log('Cours récupérés:', courses);
    });
  }

  onCourseChange(event: Event): void {
    const courseName = (event.target as HTMLSelectElement).value;

    // Trouver le cours sélectionné et obtenir ses chapitres
    this.courses$.subscribe(courses => {
      const selectedCourse = courses.find(course => course.courseName === courseName);
      console.log('Cours sélectionné:', selectedCourse);

      if (selectedCourse && selectedCourse.chapters) {
        // Assurez-vous que chapters est un tableau de chaînes de caractères
        const chapters = selectedCourse.chapters.map((chapterObj: { chapter: string }) => chapterObj.chapter);
        console.log('Chapitres du cours sélectionné:', chapters);
        this.chapters$ = of(chapters);
      } else {
        this.chapters$ = of([]);
      }
    });
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      const questionData = this.questionForm.value;
      console.log('Données de la question:', questionData);
      // Ajouter ici la logique pour soumettre la question
    }
  }
}
