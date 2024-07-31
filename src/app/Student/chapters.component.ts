import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StudentService } from '../services/student.service';
import { StudentComponent } from "./student.component";

@Component({
  selector: 'app-chapters',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StudentComponent],
  template: `
    <app-student></app-student>
    <div class="chapters-container">
      <a *ngFor="let chapter of chapters" class="chapter-card" (click)="viewChapterDetails(chapter.name)">
        {{ chapter.name }}
      </a>
    </div>
  `,
  styles: [`
    .chapters-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 20px;
      margin-top: 20px; /* Ajout de l'espace en haut */
      background-size: cover;
    }

    .chapter-card {
      background-color: #0056b3; /* Utilisation de la couleur bleue personnalisée */
      border: 1px solid #0056b3; /* Bordure légèrement plus foncée pour un meilleur contraste */
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
      width: 100%;
      max-width: 600px;
      text-decoration: none;
      color: white; /* Couleur du texte en blanc pour le contraste avec le bleu */
    }

    .chapter-card:hover {
      background-color: #004494; /* Changement de couleur au survol pour une meilleure visibilité */
      cursor: pointer;
    }
  `]
})
export class ChaptersComponent implements OnInit {
  chapters: { id: string, name: string }[] = [];

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.studentService.getAllChapters().subscribe(
      (data: string[]) => {
        this.chapters = data.map((chapter, index) => ({ id: `${index}`, name: chapter }));
      },
      error => console.error('Error fetching chapters', error)
    );
  }

  viewChapterDetails(chapterName: string): void {
    this.router.navigate(['student/chapter-detail', chapterName]);
  }
}