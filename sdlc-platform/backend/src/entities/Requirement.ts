import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
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

registerEnumType(RequirementStatus, {
  name: 'RequirementStatus',
  description: 'The status of the requirement',
});

export enum RequirementType {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non_functional',
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  USER = 'user',
  SYSTEM = 'system'
}

registerEnumType(RequirementType, {
  name: 'RequirementType',
  description: 'The type of the requirement',
});

@ObjectType()
@Entity('requirements')
export class Requirement {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field(() => RequirementStatus)
  @Column({ type: 'varchar', length: 20, default: RequirementStatus.DRAFT })
  status: RequirementStatus;

  @Field(() => RequirementType)
  @Column({ type: 'varchar', length: 20, default: RequirementType.FUNCTIONAL })
  type: RequirementType;

  @Field()
  @Column({ type: 'varchar', length: 50 })
  priority: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  jiraLink: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category: string;


  @Field(() => ID)
  @Column({ type: 'uuid' })
  projectId: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  createdById: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.requirements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for requirement status color
  get statusColor(): string {
    const colors: Record<string, string> = {
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
    const colors: Record<string, string> = {
      'low': 'green',
      'medium': 'blue',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[this.priority] || 'gray';
  }
}
