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
    course: '',
    imageContent: ''
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
      const course = params['course'];
      const chapter = params['chapter'];
      const numQuestion = params['numQuestion'];
      this.getQuestion(course, chapter, numQuestion);
    });
  }

  getQuestion(course:string, chapter: string, numQuestion: number): void {
    this.profService.getQuestionByChapterAndNumber(course, chapter, numQuestion)
      .subscribe(question => {
        console.log(question);
        this.question = question;

      });
  }
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;

    if (target && target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.result) {
                this.question.imageContent = btoa(reader.result as string);
            }
        };

        reader.readAsBinaryString(file);
    }
}

onSubmit(): void {
  this.route.params.subscribe(params => {
      const course = params['course'];
      const chapter = params['chapter'];
      const numQuestion = params['numQuestion'];
      const updatedQuestion = this.question.question;
      const updatedResponse = this.question.response;
      const updatedImageContent = this.question.imageContent;

      // Log data being sent for debugging
      console.log('Sending data:', { course, chapter, numQuestion, updatedQuestion, updatedResponse, updatedImageContent });

      this.profService.updateQuestion(course, chapter, numQuestion, updatedQuestion, updatedResponse, updatedImageContent)
          .subscribe(response => {
              console.log('Success!', response);
              alert('Question updated successfully');
              this.router.navigateByUrl('Prof/AllQuestions');
          }, error => {
              console.error('Update failed', error);
              alert('Failed to update question');
          });
  });
}
}
