import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './Project';
import { User } from './User';

export enum QMPhase {
  BUILDING_PHASE = 'building_phase',
  QA = 'qa',
  UAT = 'uat',
  SQA_SQCT = 'sqa_sqct',
  ENVIRONMENT_RECORD = 'environment_record'
}

export enum QMStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum QMDeliverable {
  BUILDING_PHASE_DESIGN_INPUTS = 'building_phase_design_inputs',
  BUILDING_PHASE_TRACE = 'building_phase_trace',
  QA_ARCHITECTURE_PATTERNS_SPEC = 'qa_architecture_patterns_spec',
  QA_INTEGRATION_DOCUMENT = 'qa_integration_document',
  QA_TTP = 'qa_ttp',
  UAT_ACCEPTANCE_TEST_PLAN = 'uat_acceptance_test_plan',
  SQA_SQCT_TEST_CASE = 'sqa_sqct_test_case',
  SQA_SQCT_TEST_REPORTS = 'sqa_sqct_test_reports', 
  SQA_SQCT_GXP = 'sqa_sqct_gxp',
  ENVIRONMENT_RECORD_DVSRS = 'environment_record_dvsrs',
  ENVIRONMENT_RECORD_URS_RECORDS = 'environment_record_urs_records'
}

@Entity('quality_management')
export class QualityManagement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  phase: QMPhase;

  @Column({ type: 'varchar', length: 20 })
  status: QMStatus;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  responsibleUserId: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  completionDate: Date | null;

  @Column({ type: 'jsonb', default: '{}' })
  deliverables: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsibleUserId' })
  responsibleUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  // Get the name of the phase
  get phaseName(): string {
    const phaseNames = {
      [QMPhase.BUILDING_PHASE]: 'Building Phase',
      [QMPhase.QA]: 'QA',
      [QMPhase.UAT]: 'UAT',
      [QMPhase.SQA_SQCT]: 'SQA/SQCT',
      [QMPhase.ENVIRONMENT_RECORD]: 'Environment Record'
    };
    return phaseNames[this.phase] || 'Unknown Phase';
  }

  // Get the color for the status
  get statusColor(): string {
    const colors = {
      [QMStatus.NOT_STARTED]: 'gray',
      [QMStatus.IN_PROGRESS]: 'blue',
      [QMStatus.COMPLETED]: 'green',
      [QMStatus.BLOCKED]: 'red'
    };
    return colors[this.status] || 'gray';
  }

  // Check if all required deliverables for the current phase are completed
  get isDeliverableCompleted(): boolean {
    const requiredDeliverables: Record<QMPhase, string[]> = {
      [QMPhase.BUILDING_PHASE]: ['building_phase_design_inputs', 'building_phase_trace'],
      [QMPhase.QA]: ['qa_architecture_patterns_spec', 'qa_integration_document', 'qa_ttp'],
      [QMPhase.UAT]: ['uat_acceptance_test_plan'],
      [QMPhase.SQA_SQCT]: ['sqa_sqct_test_case', 'sqa_sqct_test_reports', 'sqa_sqct_gxp'],
      [QMPhase.ENVIRONMENT_RECORD]: ['environment_record_dvsrs', 'environment_record_urs_records']
    };

    const required = requiredDeliverables[this.phase] || [];
    return required.every(deliverable => this.deliverables[deliverable]?.completed === true);
  }
}
