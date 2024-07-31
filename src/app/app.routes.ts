import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RequestResetComponent } from './request-reset/request-reset.component';
import { DashboardComponent } from './Prof/dashboard/dashboard.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UploadListComponent } from './Admin/upload-list/upload-list.component';
import { AddChapiterComponent } from './Prof/add-chapiter/add-chapiter.component';
import { AddQuestionsComponent } from './Prof/add-questions/add-questions.component';
import { AllChapitersComponent } from './Prof/all-chapiters/all-chapiters.component';
import { AllQuestionsComponent } from './Prof/all-questions/all-questions.component';
import { UpdateQuestionComponent } from './Prof/update-question/update-question.component';
import { StudentComponent } from './Student/student.component';
import { ChaptersComponent } from './Student/chapters.component';
import { ChapterDetailComponent } from './Student/ChapterDetail.Component';
import { StaticQuestionFormComponent } from './Student/Questions.component';
import { AdminGuard } from "./services/admin.guard";
import {ProfGuard} from "./services/Prof.guard";

import { ChangePwdComponent } from './Student/change-pwd/change-pwd.component';
import { ViewPptComponent } from './Student/viewChapiter.component';
import {StudentGuard} from "./services/Student.guard";


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent
  },

  { path: 'student', component: StudentComponent ,canActivate:[StudentGuard]},

  { path: 'student/static-question-form/:chapterName', component: StaticQuestionFormComponent ,canActivate:[StudentGuard]},
  { path: 'student/chapters', component: ChaptersComponent ,canActivate:[StudentGuard]},
  { path: 'student/chapter-detail/:chapterName', component: ChapterDetailComponent ,canActivate:[StudentGuard]},
  { path: 'student/view-ppt/:id', component: ViewPptComponent ,canActivate:[StudentGuard]},
  { path: 'student/courses/:chapterName/ppt', component: ViewPptComponent ,canActivate:[StudentGuard]},

  {
    path : '',
    component : DashboardComponent,

    children : [
      {
        path : 'Prof/Dashboard',
        component : DashboardComponent,
        canActivate:[ProfGuard]
      },


    ]
  },
  {
    path : 'request-reset',
    component : RequestResetComponent
  },
  {
    path : 'Student/ChangePwd',
    component : ChangePwdComponent,
    canActivate:[StudentGuard]

 },
  {
    path : 'reset-password',
    component : ResetPasswordComponent
  }, {
    path : 'Prof/AddChapiter',
    component : AddChapiterComponent,
    canActivate:[ProfGuard]

  },

  {
    path : 'Prof/AddQuestion',
    component : AddQuestionsComponent,
    canActivate:[ProfGuard]
  },



  { path: 'update-question/:chapter/:numQuestion', component: UpdateQuestionComponent, canActivate:[ProfGuard] },


  {
    path : 'Prof/AllChapiters',
    component : AllChapitersComponent,
    canActivate:[ProfGuard]

  }
  , {
    path : 'Prof/AllQuestions',
    component : AllQuestionsComponent,
    canActivate:[ProfGuard]

  }, {
    path: 'Prof/UpdateQuestion/:numQuestion',
    component: UpdateQuestionComponent,
    canActivate:[ProfGuard]

  },
  {
    path: 'request-reset',
    component: RequestResetComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'Admin/upload-list',
    component: UploadListComponent,
    canActivate: [AdminGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
