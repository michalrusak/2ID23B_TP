import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { sanitizeInput } from '../utils/sanitaze';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.autoLogin();
  }

  login(username: string, password: string): Observable<any> {
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);

    return this.http
      .post(
        `${environment.apiUrl}/auth/login`,
        {
          username: sanitizedUsername,
          password: sanitizedPassword,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((response: any) => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.username);
          this.isAdminSubject.next(response.isAdmin);
        }),
        catchError((error) => {
          if (
            error.status === 401 &&
            error.error.message.includes('Too many failed attempts')
          ) {
            throw new Error(
              'Too many failed login attempts. Please try again later.'
            );
          }

          if (
            error.status === 401 &&
            error.error.message.includes('Account is locked until')
          ) {
            throw new Error(
              'Account is locked for 15 minutes. Please try again later.'
            );
          }

          throw error;
        })
      );
  }

  register(username: string, password: string): Observable<any> {
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);

    return this.http
      .post(`${environment.apiUrl}/auth/register`, {
        username: sanitizedUsername,
        password: sanitizedPassword,
      })
      .pipe(
        tap(() => {
          console.log('User registered');
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  logout() {
    this.http
      .get(`${environment.apiUrl}/auth/logout`, {
        withCredentials: true,
      })
      .subscribe(() => {
        console.log('Logged out');
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      });
  }

  autoLogin() {
    this.http
      .get(`${environment.apiUrl}/auth/auto-login`, {
        withCredentials: true,
      })
      .subscribe((response: any) => {
        console.log(response);
        if (response.username) {
          this.currentUserSubject.next(response.username);
          this.isAdminSubject.next(response.isAdmin);
        } else {
          this.logout();
        }
      });
  }
}
