import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

import { ProfMenuComponent } from '../Prof/prof-menu/prof-menu.component';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { StudentService } from '../services/student.service';
import { StudentComponent } from './student.component';
import { StudentMenuComponent } from "./student-menu/student-menu.component";
import { FooterComponent } from "../footer/footer.component";

interface Question {
  numQuestion: number;
  question: string;
  response: string;
  imageContent: string;
  imagePath: string;
}

@Component({
  selector: 'app-static-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ProfMenuComponent, RouterOutlet, StudentComponent, StudentMenuComponent, FooterComponent],
  template: `
  <app-header></app-header>
    <app-student-menu></app-student-menu>
    <div class="container">
      <h2 class="form-title">Formulaire de Questions</h2>
      <form *ngIf="questions.length > 0" (ngSubmit)="submitAnswers()">
        <div *ngIf="currentQuestion" class="form-group">
          <img 
            *ngIf="currentQuestion.imageContent" 
            [src]="'data:image/jpeg;base64,' + currentQuestion.imageContent" 
            alt="Image associée à la question" 
            class="question-image"
            (click)="openImageModal('data:image/jpeg;base64,' + currentQuestion.imageContent)">
            <label [for]="currentQuestion.numQuestion" class="form-label">{{ currentQuestion.question }}</label>

          <input
            type="text"
            [id]="currentQuestion.numQuestion"
            [(ngModel)]="responses[currentQuestion.numQuestion]"
            [name]="currentQuestion.numQuestion.toString()"
            class="form-control"
            placeholder="Votre réponse"
          />
          <div *ngIf="submitted" class="response">
            <p class="response-title">Correction:</p>
            <textarea readonly class="response-textarea">{{ currentQuestion.response }}</textarea>
          </div>
        </div>
        
        <button type="submit" class="btn btn-submit">Soumettre</button>
      </form>
      <div *ngIf="questions.length === 0">
        <p>Aucune question disponible pour le chapitre sélectionné.</p>
      </div>
      <div class="navigation-buttons">
        <button type="button" (click)="prevQuestion()" [disabled]="currentIndex === 0" class="btn btn-nav btn-prev">Précédent</button>
        <button type="button" (click)="nextQuestion()" [disabled]="currentIndex === questions.length - 1" class="btn btn-nav btn-next">Suivant</button>
      </div>
    </div>
    
    <!-- Image Modal -->
<div *ngIf="isModalOpen" class="image-modal" (click)="closeImageModal()">
  <img 
    *ngIf="modalImageSrc" 
    [src]="modalImageSrc" 
    [ngClass]="{'normal': !isFullScreen}" 
    class="modal-image" 
    (click)="modalImageSrc && openImageModal(modalImageSrc); $event.stopPropagation()"> <!-- Add this check -->
</div>
 
<app-footer></app-footer>
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
      margin-bottom: 20px;
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
      margin-top: 20px;
    }

    .btn-submit:hover {
      background-color: rgba(253, 173, 2, 0.8);
    }

    .btn-submit:focus {
      outline: none;
      box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.25);
    }

    .btn-nav {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }

    .btn-prev {
      margin-right: auto;
    }

    .btn-next {
      margin-left: auto;
    }

    .btn-nav:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .response {
      margin-top: 15px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f1f1f1;
      color: #007bff;
      font-style: italic;
    }

    .response-title {
      font-weight: bold;
      color: #333;
    }

    .response-textarea {
      width: 100%;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      box-sizing: border-box;
      resize: vertical;
      min-height: 100px;
      background-color: #fff;
      color: #333;
    }

    .question-image {
      display: block;
      max-width: 100%;
      height: auto;
      margin-bottom: 15px;
      cursor: pointer;
    }
    .image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Dark overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Ensure it's on top */
  cursor: pointer; /* Allow clicking to close or exit fullscreen */
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Maintain aspect ratio */
  cursor: pointer; /* Indicate clickable behavior */
}

.image-modal.normal {
  width: auto;
  height: auto;
  background-color: transparent; /* No dark overlay in normal size */
}

.modal-image.normal {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

 



    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
  `]
})
export class StaticQuestionFormComponent implements OnInit {
  questions: Question[] = [];
  responses: { [key: string]: string } = {};
  submitted: boolean = false;
  currentIndex: number = 0;
  isModalOpen: boolean = false;
  modalImageSrc: string | null = null;
  isFullScreen: boolean = false;

  get currentQuestion(): Question | null {
    return this.questions[this.currentIndex] || null;
  }

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const chapterName = params['chapterName'];
      const courseName = params['courseName'];

      this.loadQuestions(courseName, chapterName);
    });
  }

  loadQuestions(courseName: string, chapterName: string): void {
    this.studentService.getChapterQuestions(courseName, chapterName).subscribe(response => {
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
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.submitted = false;
      this.currentIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentIndex > 0) {
      this.submitted = false;
      this.currentIndex--;
    }
  }

  openImageModal(imageSrc: string): void {
    this.modalImageSrc = imageSrc;
    this.isModalOpen = true;
  }

  closeImageModal(): void {
    this.isModalOpen = false;
    this.modalImageSrc = null;
  }
}
