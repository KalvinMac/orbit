import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  status: TestStatus;

  @Column({ type: 'varchar', length: 20 })
  type: TestType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'text', nullable: true })
  prerequisites: string;

  @Column({ type: 'text' })
  steps: string;

  @Column({ type: 'text' })
  expectedResults: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  requirementId: string | null;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  automationScript: string | null;

  @ManyToOne(() => Project, project => project.testCases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => Requirement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @OneToMany(() => TestRun, testRun => testRun.testCase)
  testRuns: TestRun[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for test status color
  get statusColor(): string {
    const colors = {
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
