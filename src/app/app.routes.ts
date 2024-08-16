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
import {CourseInputComponent} from "./Prof/AddCourse.component";
import {AddChapterComponent} from "./Prof/add-chapter2.component";
import {AddQuestionsComponent2} from "./Prof/add-question2.component";
import {UpdateChapterComponent} from "./Prof/UpdateChapter.component";




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

  { path: 'student', component: StudentComponent},
  { path: 'add', component:    AddChapterComponent},
  { path: 'student/static-question-form/:courseName/:chapterName', component: StaticQuestionFormComponent },
  { path: 'student/chapters', component: ChaptersComponent },
  { path: 'student/chapter-detail/:courseName', component: ChapterDetailComponent },
  { path: 'student/view-ppt/:id', component: ViewPptComponent },

  { path: 'student/courses/:chapterName/ppt', component: ViewPptComponent },
  { path: 'course', component:  CourseInputComponent },


  { path: 'add2', component:      AddQuestionsComponent2},

  { path: 'update-chapter/:courseName/:chapterName', component: UpdateChapterComponent },
  { path: 'student/courses/:id/ppt', component: ViewPptComponent ,canActivate:[StudentGuard]},


  { path: 'courses/:courseName/:id/ppt', component: ViewPptComponent },
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
  path : 'Prof/ChangePwd',
  component : ChangePwdComponent,

},
{
  path : 'Admin/ChangePwd',
  component : ChangePwdComponent,

},
  {
    path : 'reset-password',
    component : ResetPasswordComponent
  }, {
    path : 'Prof/AddChapiter',
    component : AddChapterComponent,


  },
  {
    path : 'Prof/AddCourse',
    component : CourseInputComponent,


  },


  {
    path : 'Prof/AddQuestion',
    component : AddQuestionsComponent,
    canActivate:[ProfGuard]
  },



  { path: 'update-question/:course/:chapter/:numQuestion', component: UpdateQuestionComponent, canActivate:[ProfGuard] },


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
