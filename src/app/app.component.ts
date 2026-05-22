import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'qa-portal';
  isDashboard = true;

  constructor(private location: Location, private router: Router) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.isDashboard = e.urlAfterRedirects === '/dashboard' || e.urlAfterRedirects === '/';
      }
    });
  }

  goBack(): void { this.location.back(); }
}
