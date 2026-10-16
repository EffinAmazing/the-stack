import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// UI convenience only — the server enforces admin access with requireAdmin.
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    const user = this.auth.getCurrentUser();
    if (!user) {
      return this.router.parseUrl('/profile/signin');
    }
    if (user.role !== 0) {
      return this.router.parseUrl('/profile');
    }
    return true;
  }
}
