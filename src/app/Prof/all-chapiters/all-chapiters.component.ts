import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfService } from '../../services/prof.service';
import { CoursDocument } from '../../models/course'; // Assurez-vous que ce modèle est correct
import { Router } from '@angular/router';
import {data} from "autoprefixer";

@Component({
  selector: 'app-all-chapiters',
  standalone: true,
  imports: [HeaderComponent, ProfMenuComponent, FormsModule, CommonModule],
  templateUrl: './all-chapiters.component.html',
  styleUrls: ['./all-chapiters.component.css'] // Correction de 'styleUrl' en 'styleUrls'
})
export class AllChapitersComponent implements OnInit {
  courses: CoursDocument[] = []; // Utilisation de CoursDocument ici
  profService = inject(ProfService);
  router = inject(Router);
  isVisibleToStudents: boolean = false;

  ngOnInit(): void {
    this.loadCourses();
  }



  makeVisibleToStudents(courseName: string, chapterName: string, isVisible: boolean): void {
    this.profService.updateChapterVisibility(courseName, chapterName, isVisible).subscribe(
      () => {
        // Mettre à jour la visibilité localement ou recharger les données si nécessaire
        this.loadCourses();
      },
      error => {
        console.error('Error updating chapter visibility', error);
      }
    );
  }



  // downloadCourse(courseName: string, chapterName: string): void {
  //   this.profService.downloadCourse(courseName, chapterName).subscribe(blob => {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `${chapterName}.pdf`; // Ou le format approprié
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   }, error => {
  //     console.error('Error downloading the chapter:', error);
  //   });
  // }




  loadCourses(): void {
    this.profService.getCourses2().subscribe(
      data => {
        this.courses = data;
        console.log('Courses data:', data);
      },
      error => {
        console.error('Error loading courses', error);
      }
    );
  }



  deleteChapter(courseName: string, chapterName: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le chapitre ${chapterName} du cours ${courseName} ?`)) {
      this.profService.deleteChapter(courseName, chapterName).subscribe(
        () => {

          this.loadCourses();
        },
          (error: any) => {
          console.error('Error deleting chapter', error);
        }
      );
    }
  }
  protected readonly data = data;
}
