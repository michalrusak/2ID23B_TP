import { Component, inject, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  sanitizer = inject(DomSanitizer);
  sanitizedContent: SafeHtml = '';

  constructor(
    private blogService: BlogService,
  ) {}

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(input.value);
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
    console.log(this.searchText);
    if (this.searchText === '') {
      alert('Please enter a search term');
      this.blogService.getPosts().subscribe((data) => {
        this.posts = data;
      });
    } else {
      this.posts = this.posts.filter((post) => {
        return post.title
          .toLocaleLowerCase()
          .match(this.searchText.toLocaleLowerCase());
      });
    }
  }
}
