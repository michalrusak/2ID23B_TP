import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

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
    return this.http
      .post(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        map((response: any) => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.username);
          this.isAdminSubject.next(response.isAdmin);
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  register(user: User): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, user).pipe(
      tap(() => {
        console.log('User registered');
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  autoLogin() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http
        .get(`${environment.apiUrl}/auth/auto-login`, { headers })
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
}
