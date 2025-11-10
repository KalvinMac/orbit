import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';
import { User } from './User';

export enum RequirementStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  IMPLEMENTED = 'implemented',
  REJECTED = 'rejected',
  DEPRECATED = 'deprecated'
}

export enum RequirementType {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non_functional',
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  USER = 'user',
  SYSTEM = 'system'
}

@Entity('requirements')
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 20, default: RequirementStatus.DRAFT })
  status: RequirementStatus;

  @Column({ type: 'varchar', length: 20, default: RequirementType.FUNCTIONAL })
  type: RequirementType;

  @Column({ type: 'varchar', length: 50 })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @ManyToOne(() => Project, (project) => project.requirements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for requirement status color
  get statusColor(): string {
    const colors = {
      [RequirementStatus.DRAFT]: 'gray',
      [RequirementStatus.IN_REVIEW]: 'blue',
      [RequirementStatus.APPROVED]: 'green',
      [RequirementStatus.IMPLEMENTED]: 'purple',
      [RequirementStatus.REJECTED]: 'red',
      [RequirementStatus.DEPRECATED]: 'orange'
    };
    return colors[this.status] || 'gray';
  }

  // Virtual property for priority color
  get priorityColor(): string {
    const colors = {
      'low': 'green',
      'medium': 'blue',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[this.priority] || 'gray';
  }
}
