import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Project } from './Project';
import { User } from './User';

export enum DeploymentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

registerEnumType(DeploymentStatus, {
  name: 'DeploymentStatus',
  description: 'The status of the deployment',
});

export enum DeploymentType {
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial'
}

registerEnumType(DeploymentType, {
  name: 'DeploymentType',
  description: 'The type of the deployment',
});

export enum Environment {
  DEV = 'development',
  QA = 'qa',
  STAGING = 'staging',
  UAT = 'uat',
  PRODUCTION = 'production'
}

registerEnumType(Environment, {
  name: 'Environment',
  description: 'The environment of the deployment',
});

@ObjectType()
@Entity('deployments')
export class Deployment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => DeploymentStatus)
  @Column({ type: 'varchar', length: 20 })
  status: DeploymentStatus;

  @Field(() => DeploymentType)
  @Column({ type: 'varchar', length: 20 })
  type: DeploymentType;

  @Field(() => Environment)
  @Column({ type: 'varchar', length: 20 })
  environment: Environment;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Field()
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  releaseNotes: string | null;

  @Field()
  @Column({ type: 'timestamp' })
  plannedDate: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completionDate: Date | null;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  projectId: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  deployedById: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  approvedById: string | null;

  @Field()
  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  deploymentPlan: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  rollbackPlan: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  postDeploymentValidation: string | null;

  @Field(() => [String], { nullable: true })
  @Column("simple-array", { nullable: true })
  links: string[];

  @Field(() => Project)
  @ManyToOne(() => Project, project => project.deployments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deployedById' })
  deployedBy: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for deployment status color
  get statusColor(): string {
    const colors: Record<string, string> = {
      [DeploymentStatus.PLANNED]: 'blue',
      [DeploymentStatus.IN_PROGRESS]: 'orange',
      [DeploymentStatus.COMPLETED]: 'green',
      [DeploymentStatus.FAILED]: 'red',
      [DeploymentStatus.ROLLED_BACK]: 'purple'
    };
    return colors[this.status] || 'gray';
  }

  // Virtual property to check if deployment is active
  @Field()
  get isActive(): boolean {
    return [DeploymentStatus.PLANNED, DeploymentStatus.IN_PROGRESS].includes(this.status as DeploymentStatus);
  }
}
