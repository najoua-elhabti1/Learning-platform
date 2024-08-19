import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfService } from '../../services/prof.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [HeaderComponent, ProfMenuComponent, CommonModule, FormsModule, FooterComponent],
  templateUrl: './add-questions.component.html',
  styleUrls: ['./add-questions.component.css']
})
export class AddQuestionsComponent implements OnInit {
  numQuestion: number | null = null;
  manualQuestion: string = '';
  manualResponse: string = '';
  courses$: Observable<any[]> = of([]);
  chapters$: Observable<string[]> = of([]);
  selectedCourse: string = '';
  selectedChapter: string = '';
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  selectedImages: File[] = [];
  uploadStatus: string = '';
  uploadImagesStatus: string = '';
  AddStatus: string = '';
  errorMessage: string = '';
  profService = inject(ProfService);

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

  onExcelFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onImagesFolderSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedImages = files; // Store the files for uploading
    }
  }

  toggleQuestionType(event: Event) {
    const target = event.target as HTMLInputElement;
    const excelSection = document.getElementById('excelUploadSection');
    const manualSection = document.getElementById('manualEntrySection');
    if (excelSection && manualSection) {
      if (target.value === 'excel') {
        excelSection.classList.remove('hidden');
        manualSection.classList.add('hidden');
      } else if (target.value === 'manual') {
        excelSection.classList.add('hidden');
        manualSection.classList.remove('hidden');
      }
    }
  }

  uploadQuestions() {
    if (this.selectedFile && this.selectedImages.length > 0) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      // Add images to FormData
      for (let i = 0; i < this.selectedImages.length; i++) {
        formData.append('folder', this.selectedImages[i]);
      }
      this.profService.addQuestionsFromExcel(formData).subscribe(
        () => {
          this.uploadStatus = 'Fichier et images téléchargés avec succès !';
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur de téléchargement :', error);
          if (error.status === 401) {
            this.uploadStatus = 'Non autorisé. Veuillez vous reconnecter.';
          } else {
            this.uploadStatus = `${error.status} Échec du téléchargement du fichier et des images.`;
          }
        }
      );
    } else {
      this.uploadStatus = 'Veuillez choisir un fichier Excel et des images.';
    }
  }

  onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedImage = target.files[0];
    }
  }

  addManualQuestion() {
    const formData = new FormData();

    if (this.numQuestion && this.selectedImage) {
      formData.append('numQuestion', this.numQuestion.toString());
      formData.append('question', this.manualQuestion);
      formData.append('response', this.manualResponse);
      formData.append('course', this.selectedCourse);
      formData.append('chapter', this.selectedChapter);
      formData.append('imagePath', this.selectedImage, this.selectedImage.name);
    }

    this.profService.addManualQuestion(formData).subscribe(
      () => {
        this.AddStatus = 'Question ajoutée avec succès !';
      },
      () => {
        this.AddStatus = 'Échec de l\'ajout de la question.';
      }
    );
  }
}
