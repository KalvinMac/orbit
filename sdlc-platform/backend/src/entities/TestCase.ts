import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Project } from './Project';
import { Requirement } from './Requirement';
import { User } from './User';
import { TestRun } from './TestRun';

export enum TestStatus {
  DRAFT = 'draft',
  READY = 'ready',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}

registerEnumType(TestStatus, {
  name: 'TestStatus',
  description: 'The status of the test case',
});

export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  USABILITY = 'usability',
  REGRESSION = 'regression',
  ACCEPTANCE = 'acceptance',
  REGULATORY = 'regulatory'
}

registerEnumType(TestType, {
  name: 'TestType',
  description: 'The type of the test case',
});

@ObjectType()
@Entity('test_cases')
export class TestCase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field(() => TestStatus)
  @Column({ type: 'varchar', length: 20 })
  status: TestStatus;

  @Field(() => TestType)
  @Column({ type: 'varchar', length: 20 })
  type: TestType;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  priority: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  prerequisites: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  steps: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  expectedResults: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  jiraLink: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  projectId: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  requirementId: string | null;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  createdById: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @Field()
  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  automationScript: string | null;

  @Field(() => Project)
  @ManyToOne(() => Project, project => project.testCases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Field(() => Requirement, { nullable: true })
  @ManyToOne(() => Requirement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @OneToMany(() => TestRun, testRun => testRun.testCase)
  testRuns: TestRun[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for test status color
  get statusColor(): string {
    const colors: Record<string, string> = {
      [TestStatus.DRAFT]: 'gray',
      [TestStatus.READY]: 'blue',
      [TestStatus.RUNNING]: 'orange',
      [TestStatus.PASSED]: 'green',
      [TestStatus.FAILED]: 'red',
      [TestStatus.BLOCKED]: 'purple'
    };
    return colors[this.status] || 'gray';
  }
}
