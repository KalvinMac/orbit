import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';
import { User } from './User';

export enum DeploymentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

export enum DeploymentType {
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial'
}

export enum Environment {
  DEV = 'development',
  QA = 'qa',
  STAGING = 'staging',
  UAT = 'uat',
  PRODUCTION = 'production'
}

@Entity('deployments')
export class Deployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 20 })
  status: DeploymentStatus;

  @Column({ type: 'varchar', length: 20 })
  type: DeploymentType;

  @Column({ type: 'varchar', length: 20 })
  environment: Environment;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'text', nullable: true })
  releaseNotes: string | null;

  @Column({ type: 'timestamp' })
  plannedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completionDate: Date | null;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  deployedById: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string | null;

  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'text', nullable: true })
  deploymentPlan: string | null;

  @Column({ type: 'text', nullable: true })
  rollbackPlan: string | null;

  @Column({ type: 'text', nullable: true })
  postDeploymentValidation: string | null;

  @ManyToOne(() => Project, project => project.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deployedById' })
  deployedBy: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for deployment status color
  get statusColor(): string {
    const colors = {
      [DeploymentStatus.PLANNED]: 'blue',
      [DeploymentStatus.IN_PROGRESS]: 'orange',
      [DeploymentStatus.COMPLETED]: 'green',
      [DeploymentStatus.FAILED]: 'red',
      [DeploymentStatus.ROLLED_BACK]: 'purple'
    };
    return colors[this.status] || 'gray';
  }

  // Virtual property to check if deployment is active
  get isActive(): boolean {
    return [DeploymentStatus.PLANNED, DeploymentStatus.IN_PROGRESS].includes(this.status as DeploymentStatus);
  }
}
