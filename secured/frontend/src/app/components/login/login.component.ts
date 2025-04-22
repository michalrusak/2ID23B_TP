import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.username.length < 3 || this.password.length < 3) {
      alert('Username and password must be at least 3 characters long');
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        if (
          error.message ===
          'Too many failed login attempts. Please try again later.'
        ) {
          alert(error.message);
        } else if (
          error.message ===
          'Account is locked for 15 minutes. Please try again later.'
        ) {
          alert(error.message);
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
        console.error('Login error:', error);
      }
    );
  }
}
