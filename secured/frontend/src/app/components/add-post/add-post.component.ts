import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.scss',
})
export class AddPostComponent {
  title = '';
  content = '';

  constructor(private blogService: BlogService, private router: Router) {}

  addPost() {
    this.blogService
      .addPost({
        title: this.title,
        content: this.content,
      })
      .subscribe(() => {
        this.router.navigate(['/posts']);
      });
  }
}
