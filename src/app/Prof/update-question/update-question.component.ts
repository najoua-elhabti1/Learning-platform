import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import {QuestionDTO} from "../../models/QuestionDTO.model";
import {ProfService} from "../../services/prof.service";
import {HeaderComponent} from "../../header/header.component";
import {ProfMenuComponent} from "../prof-menu/prof-menu.component";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-update-question',

  standalone: true,
  imports: [HeaderComponent, ProfMenuComponent, FormsModule, CommonModule],
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css']
})
export class UpdateQuestionComponent implements OnInit {
  question: QuestionDTO = {
    numQuestion: 0,
    question: '',
    response: '',
    chapter: '',
    course: ''
  };
  courses: string[] = [];  // Remplir avec les options de cours
  chapters: string[] = []; // Remplir avec les options de chapitres

  constructor(
    private profService: ProfService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const chapter = params['chapter'];
      const numQuestion = params['numQuestion'];
      this.getQuestion(chapter, numQuestion);
    });
  }

  getQuestion(chapter: string, numQuestion: number): void {
    this.profService.getQuestionByChapterAndNumber(chapter, numQuestion)
      .subscribe(question => {
        this.question = question;

      });
  }

  onSubmit(): void {
    this.route.params.subscribe(params => {
      const chapter = params['chapter'];
      const numQuestion = params['numQuestion'];
      const updatedQuestion = this.question.question;
      const updatedResponse = this.question.response;
console.log(updatedQuestion);
console.log(updatedResponse);
      this.profService.updateQuestion(chapter, numQuestion, updatedQuestion, updatedResponse)
        .subscribe(response => {
          alert('Question updated successfully');
          this.router.navigate(['/some-path']); // Mettez à jour avec le chemin souhaité
        }, error => {
          console.error('Update failed', error);
          alert('Failed to update question');
        });
    });
  }
}
