import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column({ default: 0 })
  failed_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;
}
