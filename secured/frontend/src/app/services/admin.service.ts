import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any[]>(this.apiUrl, {
      withCredentials: true,
    });
  }

  updateRole(id: number, role: string) {
    return this.http.patch(
      `${this.apiUrl}/${id}`,
      { role },
      {
        withCredentials: true,
      }
    );
  }
}
