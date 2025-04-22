import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [NgIf],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
})
export class PostDetailComponent implements OnInit {
  post: any;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.blogService.getPostById(Number(id)).subscribe((data) => {
      this.post = data;
    });
  }
}
