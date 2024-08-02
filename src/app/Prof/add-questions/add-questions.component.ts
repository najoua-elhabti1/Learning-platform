import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { ProfMenuComponent } from '../prof-menu/prof-menu.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfService } from '../../services/prof.service';

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [HeaderComponent, ProfMenuComponent, CommonModule, FormsModule],
  templateUrl: './add-questions.component.html',
  styleUrls: ['./add-questions.component.css']
})
export class AddQuestionsComponent {
  numQuestion: number | null = null;
  manualQuestion: string = '';
  manualResponse: string = '';
  courses = ['Course 1', 'Course 2', 'Course 3'];
  chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3'];
  selectedCourse: string = this.courses[0];
  selectedChapter: string = this.chapters[0];
  selectedFile: File | null = null;
  uploadStatus: string = '';
  uploadImagesStatus: string = '';
  AddStatus: string = '';
  profService = inject(ProfService);
  selectedImage: File | null  = null;
  selectedImages: File[] = [];

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
  uploadQuestionsImages(){

  }

  // addManualQuestion() {
  //   if (this.manualQuestion && this.manualResponse && this.numQuestion !== null) {
  //     this.profService.addManualQuestion(this.selectedChapter, this.numQuestion, this.manualQuestion, this.manualResponse).subscribe(
  //       () => {
  //         this.AddStatus = 'Question ajoutée avec succès !';
  //       },
  //       error => {
  //         console.error('Erreur lors de l\'ajout de la question :', error);
  //         this.AddStatus = 'Une erreur est survenue lors de l\'ajout de la question.';
  //       }
  //     );
  //   } else {
  //     this.AddStatus = 'Tous les champs doivent être remplis.';
  //   }
  // }
  onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if(target.files){
    if (target.files.length > 0) {
      this.selectedImage = target.files[0];
    }
  }
  }
  addManualQuestion() {
    const formData = new FormData();
    
    if (this.numQuestion  && this.selectedImage) {
        formData.append('numQuestion', this.numQuestion.toString());
        formData.append('question', this.manualQuestion);
        formData.append('response', this.manualResponse);
        formData.append('course', this.selectedCourse);
        formData.append('chapter', this.selectedChapter);
        formData.append('imagePath', this.selectedImage, this.selectedImage.name);
    }

    this.profService.addManualQuestion(formData).subscribe(
        response => {
            this.AddStatus = 'Question added successfully!';
        },
        error => {
            this.AddStatus = 'Failed to add question.';
        }
    );
}


}
