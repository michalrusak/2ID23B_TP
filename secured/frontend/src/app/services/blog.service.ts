import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { sanitizeInput } from '../utils/sanitaze';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts() {
    return this.http.get<any[]>(this.apiUrl, {
      withCredentials: true,
    });
  }

  getPostById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  addPost(title: string, content: string) {
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);

    return this.http.post(
      this.apiUrl,
      { title: sanitizedTitle, content: sanitizedContent },
      {
        withCredentials: true,
      }
    );
  }

  deletePost(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
