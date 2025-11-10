import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Requirement } from './Requirement';
import { TestCase } from './TestCase';
import { Deployment } from './Deployment';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  status: ProjectStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  targetEndDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'uuid', nullable: true })
  leadId: string | null;

  @ManyToOne(() => User, (user) => user.ownedProjects, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => User, (user) => user.leadProjects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leadId' })
  lead: User | null;

  @OneToMany(() => Requirement, (requirement) => requirement.project)
  requirements: Requirement[];

  @OneToMany(() => TestCase, (testCase) => testCase.project)
  testCases: TestCase[];

  @OneToMany(() => Deployment, (deployment) => deployment.project)
  deployments: Deployment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for project duration in days
  get durationInDays(): number | null {
    if (!this.startDate) return null;
    const endDate = this.actualEndDate || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Virtual property to check if project is active
  get isActive(): boolean {
    return [ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS].includes(this.status as ProjectStatus);
  }
}
