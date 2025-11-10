import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Project } from './Project';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'varchar', nullable: true })
  position: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => Project, (project) => project.lead)
  leadProjects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
