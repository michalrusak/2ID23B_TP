import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  currentUser: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    this.adminService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  makeAdmin(id: number) {
    this.adminService.updateRole(id, 'admin').subscribe(() => {
      this.ngOnInit();
    });
  }
}
