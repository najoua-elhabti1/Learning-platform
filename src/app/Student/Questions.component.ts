import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { ProfMenuComponent } from '../Prof/prof-menu/prof-menu.component';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { StudentService } from '../services/student.service';
import {StudentComponent} from "./student.component";

@Component({
  selector: 'app-static-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent, ProfMenuComponent, RouterOutlet, StudentComponent],
  template: `
    <app-student></app-student>
    <div class="container">
      <h2 class="form-title">Formulaire de Questions</h2>
      <form *ngIf="questions.length > 0" (ngSubmit)="submitAnswers()">
        <div *ngFor="let question of questions" class="form-group">
          <label [for]="question.numQuestion" class="form-label">{{ question.question }}</label>
          <input
            type="text"
            [id]="question.numQuestion"
            [(ngModel)]="responses[question.numQuestion]"
            [name]="question.numQuestion"
            class="form-control"
            placeholder="Votre réponse"
          />
          <div *ngIf="submitted" class="response">
            Votre réponse: {{ responses[question.numQuestion] }}<br>
            Correction: {{ question.response }}
          </div>
        </div>
        <button type="submit" class="btn btn-submit">Soumettre</button>
      </form>
      <div *ngIf="questions.length === 0">
        <p>Aucune question disponible pour le chapitre sélectionné.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 40px auto 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .form-title {
      text-align: center;
      margin-bottom: 20px;
      font-size: 24px;
      color: #333;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: rgba(253, 173, 2, 1);
      outline: none;
      box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.25);
    }

    .btn-submit {
      width: 100%;
      padding: 10px;
      background-color: rgba(253, 173, 2, 1);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }

    .btn-submit:hover {
      background-color: rgba(253, 173, 2, 1);
    }

    .btn-submit:focus {
      outline: none;
      box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.25);
    }

    .response {
      margin-top: 5px;
      color: #007bff;
      font-style: italic;
    }
  `]
})
export class StaticQuestionFormComponent implements OnInit {
  questions: any[] = [];
  responses: { [key: string]: string } = {};
  submitted: boolean = false;

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const chapterName = params['chapterName'];
      this.loadQuestions(chapterName);
    });
  }

  loadQuestions(chapterName: string): void {
    this.studentService.getChapterDetails(chapterName).subscribe(response => {
      if (response && response.questions) {
        this.questions = response.questions;
        // Initialize responses with the current answers if available
        this.questions.forEach(question => {
          this.responses[question.numQuestion] = '';
        });
      }
    });
  }

  submitAnswers(): void {
    this.submitted = true;
    // The user's responses are already stored in this.responses through ngModel binding
  }
}
