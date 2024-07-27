import { Injectable } from '@angular/core';

function _window(): any {
  // Return the global native browser window object
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  get nativeWindow(): any {
    return _window();
  }
}
