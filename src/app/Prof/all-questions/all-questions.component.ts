import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import {QuestionDTO} from "../../models/QuestionDTO.model";
import {ProfService} from "../../services/prof.service";

@Component({
  selector: 'app-all-questions',
  standalone: true,
  imports: [HeaderComponent, ProfMenuComponent, FormsModule, CommonModule],
  templateUrl: './all-questions.component.html',
  styleUrls: ['./all-questions.component.css'] // Corriger l'orthographe de 'styleUrls'
})
export class AllQuestionsComponent implements OnInit {
  questions: QuestionDTO[] = [];
  profService = inject(ProfService); // Utiliser ProfService
  router = inject(Router);

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.profService.getAllQuestions().subscribe(
      (data: QuestionDTO[]) => {
        this.questions = data;
        console.log(data[0]);
      },
      (error: any) => {
        console.error('Error fetching questions', error);
      }
    );
  }

  deleteAllQuestions(): void {
    this.profService.deleteAllQuestions().subscribe(
      () => {
        console.log('All questions deleted successfully');
        this.loadQuestions();
      },
      (error) => {
        console.error('Error deleting questions:', error);
      }
    );
  }

  downloadQuestionsExcel(): void {
    this.profService.downloadExcelQuestions().subscribe(
      (blob: Blob) => {
        saveAs(blob, 'questions.xlsx');
      },
      (error) => {
        console.error('Error downloading Excel file:', error);
      }
    );
  }


  deleteQuestion(course: string, chapter: string, numQuestion: number): void {
    this.profService.deleteQuestionByChapterAndNumber(course, chapter, numQuestion)
      .subscribe(
        response => {
          console.log('Question deleted successfully:', response);
          this.loadQuestions();
        },
        error => {
          console.error('Error deleting question:', error);
        }
      );
  }

  navigateToUpdateQuestion(course: string, chapter: string, numQuestion: number): void {
    this.router.navigate(['/update-question', course, chapter, numQuestion]);
  }
}
