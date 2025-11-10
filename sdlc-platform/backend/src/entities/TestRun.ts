import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TestCase } from './TestCase';
import { User } from './User';

export enum TestResult {
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped',
  NOT_RUN = 'not_run'
}

@Entity('test_runs')
export class TestRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  result: TestResult;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  actualResults: string | null;

  @Column({ type: 'uuid' })
  testCaseId: string;

  @Column({ type: 'uuid' })
  executedById: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  environment: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string | null;

  @Column({ type: 'text', nullable: true })
  errorDetails: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrls: string | null;

  @ManyToOne(() => TestCase, testCase => testCase.testRuns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testCaseId' })
  testCase: TestCase;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'executedById' })
  executedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for test result color
  get resultColor(): string {
    const colors = {
      [TestResult.PASSED]: 'green',
      [TestResult.FAILED]: 'red',
      [TestResult.BLOCKED]: 'purple',
      [TestResult.SKIPPED]: 'orange',
      [TestResult.NOT_RUN]: 'gray'
    };
    return colors[this.result] || 'gray';
  }
}
