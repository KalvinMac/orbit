import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Project } from './Project';
import { WorkflowTask } from './WorkflowTask';

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

registerEnumType(PhaseType, {
  name: 'PhaseType',
  description: 'The type of the workflow phase',
});

registerEnumType(PhaseStatus, {
  name: 'PhaseStatus',
  description: 'The status of the workflow phase',
});

@ObjectType()
@Entity('workflow_phases')
export class WorkflowPhase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50, default: 'planning' }) // Increased length for custom names
  phaseType: string;

  @Field(() => PhaseStatus)
  @Column({ type: 'varchar', length: 20 })
  status: PhaseStatus;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  projectId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // JSONB fields can be complex to map in GraphQL, often mapped as custom scalars or stringified JSON
  // For simplicity, we'll skip exposing them directly for now or map as String
  @Column({ type: 'jsonb', nullable: true })
  deliverables: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  milestones: Record<string, any> | null;

  @Field(() => Project)
  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Field(() => [WorkflowTask], { nullable: true })
  @OneToMany(() => WorkflowTask, (task) => task.phase)
  tasks: WorkflowTask[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Get the name of the phase based on the phase type
  @Field()
  get phaseName(): string {
    const phaseNames: Record<string, string> = {
      [PhaseType.PLANNING]: 'Strategic Planning and Inception',
      [PhaseType.ARCHITECTURE]: 'Architecture and System Design',
      [PhaseType.IMPLEMENTATION]: 'Implementation and Construction',
      [PhaseType.TESTING]: 'Comprehensive Testing and Validation',
      [PhaseType.DEPLOYMENT]: 'Deployment and Operational Readiness'
    };
    // If it's a known type, return the fancy name, otherwise return the type itself (capitalized potentially)
    return phaseNames[this.phaseType] || this.phaseType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get the color for the phase status
  @Field()
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
  @Field()
  get isActive(): boolean {
    return this.status === PhaseStatus.IN_PROGRESS;
  }
}
