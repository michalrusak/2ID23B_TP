import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { sanitizeInput } from '../utils/sanitaze';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPosts() {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getPostById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  addPost(title: string, content: string) {
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);

    return this.http.post(
      this.apiUrl,
      { title: sanitizedTitle, content: sanitizedContent },
      { headers: this.getHeaders() }
    );
  }

  deletePost(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
