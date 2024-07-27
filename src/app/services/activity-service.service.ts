// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ActivityService {
//   private startTime: number;

//   // constructor(private http: HttpClient, private cookieService: CookieS) {}

//   startTracking() {
//     this.startTime = Date.now();
//     this.cookieService.set('startTime', this.startTime.toString());
//   }

//   logClick(activityDetails: string) {
//     const timestamp = Date.now();
//     this.sendActivity({ activityType: 'click', timestamp, details: activityDetails });
//   }

//   logDownload(activityDetails: string) {
//     const timestamp = Date.now();
//     this.sendActivity({ activityType: 'download', timestamp, details: activityDetails });
//   }

//   stopTracking() {
//     const endTime = Date.now();
//     const duration = endTime - this.startTime;
//     this.sendActivity({ activityType: 'read', timestamp: this.startTime, duration });
//   }

//   private sendActivity(activity: any) {
//     this.http.post('/api/activities', activity).subscribe();
//   }
// }
