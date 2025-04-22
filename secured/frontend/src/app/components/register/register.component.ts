import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService
      .register({ username: this.username, password: this.password })
      .subscribe(
        () => {
          this.router.navigate(['/login']);
        },
        (error) => {
          alert('Register failed. Please try again.');
          console.error('Register error:', error);
        }
      );
  }
}
