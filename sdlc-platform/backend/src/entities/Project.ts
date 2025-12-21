import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType, Int } from 'type-graphql';
import { User } from './User';
import { Requirement } from './Requirement';
import { TestCase } from './TestCase';
import { Deployment } from './Deployment';
import { Objective } from './Objective';
import { ProjectAllocation } from './ProjectAllocation';
import { DVF } from './DVF';
import { WorkflowPhase } from './WorkflowPhase';
import { QualityManagement } from './QualityManagement';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: 'The status of the project',
});

@ObjectType()
@Entity('projects')
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Field(() => ProjectStatus)
  @Column({ type: 'varchar', length: 50 })
  status: ProjectStatus;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ type: 'int', default: 0 })
  progress: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  currentPhase: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  targetEndDate: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  objectiveId: string | null;

  @Field(() => Objective, { nullable: true })
  @ManyToOne(() => Objective, (objective) => objective.projects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'objectiveId' })
  objective: Objective | null;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  ownerId: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  leadId: string | null;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownedProjects, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.leadProjects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leadId' })
  lead: User | null;

  @OneToMany(() => Requirement, (requirement) => requirement.project)
  requirements: Requirement[];

  @OneToMany(() => TestCase, (testCase) => testCase.project)
  testCases: TestCase[];

  @OneToMany(() => Deployment, (deployment) => deployment.project)
  deployments: Deployment[];

  @Field(() => [ProjectAllocation], { nullable: true })
  @OneToMany(() => ProjectAllocation, (allocation) => allocation.project)
  allocations: ProjectAllocation[];

  @Field(() => [WorkflowPhase], { nullable: true })
  @OneToMany(() => WorkflowPhase, (phase) => phase.project)
  workflowPhases: WorkflowPhase[];

  @Field(() => [QualityManagement], { nullable: true })
  @OneToMany(() => QualityManagement, (qm) => qm.project)
  qualityManagement: QualityManagement[];

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  dvfId: string | null;

  @Field(() => DVF, { nullable: true })
  @ManyToOne(() => DVF, (dvf) => dvf.projects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dvfId' })
  dvf: DVF | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for project duration in days
  @Field(() => Int, { nullable: true })
  get durationInDays(): number | null {
    if (!this.startDate) return null;
    const endDate = this.actualEndDate || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Virtual property to check if project is active
  @Field()
  get isActive(): boolean {
    return [ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS].includes(this.status as ProjectStatus);
  }
}
