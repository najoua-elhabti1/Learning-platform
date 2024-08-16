import { Component, OnInit } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ProfService } from '../services/prof.service';
import { HeaderComponent } from '../header/header.component';
import { ProfMenuComponent } from './prof-menu/prof-menu.component';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-update-chapter',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ProfMenuComponent],
  template: `
    <app-header></app-header>
    <app-prof-menu></app-prof-menu>

    <div class="container mx-auto p-4 mt-10"> <!-- Added mt-10 here for top margin -->
      <h2 class="text-3xl font-extrabold mb-8 text-center text-gray-800">Mise à Jour du Chapitre</h2>

      <form enctype="multipart/form-data" class="bg-white shadow-lg rounded-lg px-10 pt-8 pb-8 mb-6" (ngSubmit)="onSubmit()">
        <div class="mb-6">
          <label for="courseName" class="block text-gray-700 text-sm font-bold mb-2">Nom du Cours</label>
          <input type="text" id="courseName" name="courseName" [(ngModel)]="courseName" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500" placeholder="Nom du Cours">
        </div>

        <div class="mb-6">
          <label for="chapterName" class="block text-gray-700 text-sm font-bold mb-2">Nom du Chapitre</label>
          <input type="text" id="chapterName" name="chapterName" [(ngModel)]="chapterName" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500" placeholder="Nom du Chapitre">
        </div>

        <div class="mb-6">
          <label for="file" class="block text-gray-700 text-sm font-bold mb-2">Fichier à téléverser</label>
          <input type="file" id="file" name="file" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500" (change)="onFileSelected($event)">
        </div>

        <div class="flex items-center justify-between">
          <button type="submit"
                  class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition ease-in-out duration-150">
            Mettre à Jour
          </button>
        </div>

        <div *ngIf="uploadStatus" class="mt-4">
          <p [ngClass]="uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'">{{ uploadStatus }}</p>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      background-color: #f9fafb;
      padding: 2rem;
      border-radius: 8px;
    }

    h2 {
      color: #374151;
    }

    form {
      background-color: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    label {
      font-weight: bold;
    }

    input[type="text"],
    input[type="file"] {
      padding: 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
    }

    button {
      background-color: #3b82f6;
      transition: background-color 0.2s ease-in-out;
    }

    button:hover {
      background-color: #2563eb;
    }

    button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
  `]
})
export class UpdateChapterComponent implements OnInit {
  uploadStatus: string = '';
  selectedFile: File | null = null;
  courseName: string = '';
  chapterName: string = '';

  constructor(private profService: ProfService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.courseName = this.route.snapshot.paramMap.get('courseName') || '';
    this.chapterName = this.route.snapshot.paramMap.get('chapterName') || '';
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.selectedFile && this.courseName && this.chapterName) {
      const formData = new FormData();
      formData.append('courseName', this.courseName);
      formData.append('chapter', this.chapterName);
      formData.append('file', this.selectedFile);

      this.profService.updateChapter(formData).subscribe(
        response => {
          console.log('Response received:', response);
          this.uploadStatus = 'Chapter updated successfully!';
        },
        error => {
          console.error('Update failed', error);
          this.uploadStatus = 'Error updating chapter. Please try again later.';
        }
      );
    } else {
      this.uploadStatus = 'Please select a file and ensure all fields are filled out.';
    }
  }
}
