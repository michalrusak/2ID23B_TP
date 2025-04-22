import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { sanitizeInput } from '../../utils/sanitaze';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterModule, NgFor, FormsModule, NgIf],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss',
})
export class PostListComponent implements OnInit {
  posts: any[] = [];
  searchText = '';
  sanitizedContent: SafeHtml;

  sanitizeInput = sanitizeInput;

  constructor(
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(
      this.searchText
    );
  }

  ngOnInit() {
    this.blogService.getPosts().subscribe((data) => {
      this.posts = data;
    });
  }

  deletePost(id: number) {
    this.blogService.deletePost(id).subscribe(() => {
      this.posts = this.posts.filter((post) => post.id !== id);
    });
  }

  searchPost() {
    if (this.searchText === '') {
      alert('Please enter a search term');
    } else {
      this.posts = this.posts.filter((post) => {
        return post.title
          .toLocaleLowerCase()
          .match(this.searchText.toLocaleLowerCase());
      });
    }
  }
}
