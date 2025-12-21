import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Project } from './Project';
import { User } from './User';

export enum QMPhase {
  BUILDING_PHASE = 'building_phase',
  QA = 'qa',
  UAT = 'uat',
  SQA_SQCT = 'sqa_sqct',
  ENVIRONMENT_RECORD = 'environment_record'
}

registerEnumType(QMPhase, {
  name: "QMPhase",
  description: "The phases of Quality Management",
});

export enum QMStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

registerEnumType(QMStatus, {
  name: "QMStatus",
  description: "The status of a Quality Management phase",
});

@ObjectType()
class DeliverableStatus {
  @Field({ nullable: true })
  completed: boolean;

  @Field({ nullable: true })
  link: string;
}

@ObjectType()
class DeliverablesMap {
  // Since JSONB is dynamic, handling it strictly in GraphQL can be tricky without defining every possible key.
  // For now, let's return it as a JSON string or simplified object if we can, or just use a custom scalar if we had one.
  // But standard practice in this codebase seems to be missing for JSONB.
  // Let's check how other entities handle JSONB or if they don't.
  // If not, we might fail on arbitrary JSON keys.
  // Let's try to expose it strictly as a String (serialized JSON) or try to rely on 'graphql-type-json' if installed, but checking context, we don't know dependencies.
  // Safest bet: Expose as a string for now or 'any' if the scalar is available. 
  // Actually, looking at the error `Cannot determine GraphQL output type`, likely `deliverables` field caused issues if we blindly verified it.
  // Let's SKIP exposing `deliverables` directly as a complex object for a second and just use a string for safety, OR define a generic Key-Value type if possible. 
  // However, the frontend expects `deliverables` to have keys.
  // Let's use `create-react-app` style which accepts `JSON` scalar if we had it.
  // Let's checking `OrganizationSettings` which used JSONB.
}

@ObjectType()
@Entity('quality_management')
export class QualityManagement {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => QMPhase)
  @Column({ type: 'varchar', length: 30 })
  phase: QMPhase;

  @Field(() => QMStatus)
  @Column({ type: 'varchar', length: 20 })
  status: QMStatus;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  projectId: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  responsibleUserId: string;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'date', nullable: true })
  completionDate: Date | null;

  // Returning as proper Object if GraphQL JSON is supported, otherwise String
  // We'll mark it as a derived field that returns the object, assuming GraphQL can handle the keys if we define a loose type or just don't type it strongly here?
  // TypeGraphQL needs a specific type.
  // Let's check OrganizationSettings to see how they did it.

  @Field(() => String, { name: 'deliverables', description: "JSON string of deliverables" })
  get deliverablesJSON(): string {
    return JSON.stringify(this.deliverables);
  }

  // Raw column, not exposed directly to GraphQL to avoid "Cannot determine type" error for JSONB
  @Column({ type: 'jsonb', default: '{}' })
  deliverables: Record<string, any>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Field(() => Project)
  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsibleUserId' })
  responsibleUser: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
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

  @Field()
  get statusColor(): string {
    const colors = {
      [QMStatus.NOT_STARTED]: 'gray',
      [QMStatus.IN_PROGRESS]: 'blue',
      [QMStatus.COMPLETED]: 'green',
      [QMStatus.BLOCKED]: 'red'
    };
    return colors[this.status] || 'gray';
  }

  @Field()
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
