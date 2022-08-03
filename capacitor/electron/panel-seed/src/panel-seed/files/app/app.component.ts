import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    class: 'd-flex justify-content-center align-items-center vh-100 bg-black',
  },
})
export class AppComponent {
}
