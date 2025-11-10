import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Project } from './Project';

export enum PhaseType {
  PLANNING = 'planning',              // Strategic Planning and Inception
  ARCHITECTURE = 'architecture',      // Architecture and System Design
  IMPLEMENTATION = 'implementation',  // Implementation and Construction
  TESTING = 'testing',                // Comprehensive Testing and Validation
  DEPLOYMENT = 'deployment'           // Deployment and Operational Readiness
}

export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

@Entity('workflow_phases')
export class WorkflowPhase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  phaseType: PhaseType;

  @Column({ type: 'varchar', length: 20 })
  status: PhaseStatus;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  milestones: Record<string, any> | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Get the name of the phase based on the phase type
  get phaseName(): string {
    const phaseNames = {
      [PhaseType.PLANNING]: 'Strategic Planning and Inception',
      [PhaseType.ARCHITECTURE]: 'Architecture and System Design',
      [PhaseType.IMPLEMENTATION]: 'Implementation and Construction',
      [PhaseType.TESTING]: 'Comprehensive Testing and Validation',
      [PhaseType.DEPLOYMENT]: 'Deployment and Operational Readiness'
    };
    return phaseNames[this.phaseType] || 'Unknown Phase';
  }

  // Get the color for the phase status
  get statusColor(): string {
    const colors = {
      [PhaseStatus.NOT_STARTED]: 'gray',
      [PhaseStatus.IN_PROGRESS]: 'blue',
      [PhaseStatus.COMPLETED]: 'green',
      [PhaseStatus.ON_HOLD]: 'orange'
    };
    return colors[this.status] || 'gray';
  }
  
  // Check if the phase is active
  get isActive(): boolean {
    return this.status === PhaseStatus.IN_PROGRESS;
  }
}
