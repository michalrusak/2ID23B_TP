import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  private token = localStorage.getItem('token');

  getPosts() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  getPostById(id: number) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  addPost(post: any) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    return this.http.post(this.apiUrl, post, { headers });
  }

  deletePost(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
