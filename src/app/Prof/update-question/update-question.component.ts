import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-question',
  standalone: true,
  imports: [HeaderComponent,ProfMenuComponent,FormsModule,CommonModule],
  templateUrl: './update-question.component.html',
  styleUrl: './update-question.component.css'
})
export class UpdateQuestionComponent implements OnInit {
  courses = ['Course 1', 'Course 2', 'Course 3'];
  chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3'];
  question: any = {}; // Assuming question object structure matches your form fields
  numQuestion!: number;
  authService = inject(AuthService);
  router = inject(Router);
  constructor(
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.numQuestion = params['numQuestion'];
      this.fetchQuestion(this.numQuestion);
    });
  }

  fetchQuestion(numQuestion: number): void {
    this.authService.getQuestion(numQuestion).subscribe(
      (response: any) => {
        this.question = response;
        console.log(this.question.course);
      },
      (error: any) => {
        console.error('Error fetching question:', error);
      }
    );
  }

  updateQuestion(): void {
    this.authService.updateQuestion(this.numQuestion, this.question).subscribe(
      () => {
        console.log('Question updated successfully');
        // Optionally, navigate back to the list page or show a success message
        this.router.navigateByUrl('/Prof/AllQuestions');
      },
      (error: any) => {
        console.error('Error updating question:', error);
        // Handle error, show error message to user
      }
    );
  }

}
