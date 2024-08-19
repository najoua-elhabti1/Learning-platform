import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {HeaderComponent} from "../header/header.component";
import {ProfMenuComponent} from "../Prof/prof-menu/prof-menu.component";
import {AuthService} from "../services/auth/auth.service";


@Component({
  selector: 'app-student',
  standalone: true,
  imports: [HeaderComponent, ProfMenuComponent, RouterOutlet],
  template: `
    <app-header></app-header>

    <div class="bg-customYellow">
      <nav class="container mx-auto flex justify-between items-center py-4">
        <div class="relative">
          <button class="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900" (click)="toggleQuestionMenu()">
            <span class="sr-only">Open question menu</span>
            <p>Chapters Available</p>
          </button>
          <div id="question-menu" class="origin-top-right absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden" role="menu">
            <a (click)="showChapter()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Liste des Chapitres</a>
          </div>
        </div>

        <div class="hidden md:flex items-center">
          <div class="relative">
            <label for="search" class="sr-only">Search</label>
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <input id="search" name="search" type="search" placeholder="Search" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button type="button" class="relative text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900">
            <span class="sr-only">View notifications</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .548-.215 1.082-.595 1.478L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </button>
          <div class="relative">
            <button class="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900" (click)="toggleUserMenu()">
              <span class="sr-only">Open user menu</span>
              <img class="h-8 w-8 rounded-full" src="../../../assets/2.png" alt="">
            </button>
            <div id="user-menu" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden" role="menu">
              <a (click)="navigateToChangePwd()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Changer mot de passe</a>
              <a (click)="onLogout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Déconnexion</a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  `
})
export class StudentComponent {
  constructor(private router: Router, private authService: AuthService) {
  } // Injection du service d'authentification

  toggleQuestionMenu() {
    const menu = document.getElementById('question-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  showChapter() {
    this.router.navigate(['student/chapters']);
  }

  navigateToChangePwd() {
    this.router.navigate(['/student/ChangePwd']);
  }

  onLogout(): void {
    this.authService.logout().subscribe(
      () => {
        localStorage.removeItem('connectedUser');
        localStorage.removeItem('access_token');
        this.router.navigateByUrl('login');
        console.log('Logged out successfully');
      },

    );
  }

}
