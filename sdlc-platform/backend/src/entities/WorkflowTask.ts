import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkflowPhase } from './WorkflowPhase';
import { User } from './User';
import { Project } from './Project';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// This enum reflects the tasks from the Product Engineering Workflow diagram
export enum PhaseTask {
  // Phase 1: Strategic Planning and Inception
  PROJECT_DEFINITION = 'project_definition',
  THREAT_MODELING = 'threat_modeling',
  DFT_CREATION = 'dft_creation',
  PROJECT_RISK_ISSUES_ASSESSMENT = 'project_risk_issues_assessment',
  REGULATORY_ASSESSMENT = 'regulatory_assessment',
  REQUIREMENTS_ENGINEERING = 'requirements_engineering',
  RESOURCE_BUDGET_PLANNING = 'resource_budget_planning',
  TRACEABILITY_MATRIX_CREATION = 'traceability_matrix_creation',
  CRITICAL_WORKFLOW_ANALYSIS = 'critical_workflow_analysis',
  PRODUCT_FUNCTION_DEVELOPMENT = 'product_function_development',
  JIRA_API_QUALITY_INTEGRATION = 'jira_api_quality_integration',
  
  // Phase 2: Architecture and System Design
  FORMAL_ARCHITECTURE_DEVELOPMENT = 'formal_architecture_development',
  MODULE_DESIGN_WITH_FEATURE_SIGN_OFF = 'module_design_with_feature_sign_off',
  INTERFACE_DESIGN = 'interface_design',
  UI_DESIGN = 'ui_design',
  DATA_UX_DATA_PRIVACY_DESIGN = 'data_ux_data_privacy_design',
  SECURITY_DESIGN_THREAT_MODELING = 'security_design_threat_modeling',
  OBSERVABILITY_DESIGN = 'observability_design',
  FMEA_ANALYSIS_DESIGN = 'fmea_analysis_design',
  TEST_DESIGN = 'test_design',
  OPERATIONS_ANALYTICS_DESIGN = 'operations_analytics_design',
  PROJECT_GMP = 'project_gmp',
  COMPREHENSIVE_TEST_PLANNING_READY = 'comprehensive_test_planning_ready',
  INITIAL_FMEA_REPORTS = 'initial_fmea_reports',
  
  // Phase 3: Implementation and Construction
  ENVIRONMENT_SET_UP = 'environment_set_up',
  CODE_IMPLEMENTATION = 'code_implementation',
  CI_CD_PIPELINES = 'ci_cd_pipelines',
  AUTOMATED_UNIT_INTEGRATION_WITH_DAY_COMPONENTS = 'automated_unit_integration_with_day_components',
  BUILD_MERGE_ANALYSIS_CODE_INTEGRATION = 'build_merge_analysis_code_integration',
  OBSERVABILITY_OPERATIONAL_ENV_IMPLEMENTATION = 'observability_operational_env_implementation',
  ERROR_AUDIT_CONFIG_IMPLEMENTATION = 'error_audit_config_implementation',
  TECH_DESIGN_SUPPORT_TOOLS_DESIGN_IMPLEMENTATION = 'tech_design_support_tools_design_implementation',
  CLOUD_INFRASTRUCTURE_AUTOMATION = 'cloud_infrastructure_automation',
  SCA_CODE_ANALYSIS_REPORTS = 'sca_code_analysis_reports',
  EVIDENCE_REPORTS_SPECS_TEST_COVERAGE = 'evidence_reports_specs_test_coverage',
  TECHNICAL_DESIGN = 'technical_design',
  OPERATIONAL_IMPLEMENTATION_REPORTS = 'operational_implementation_reports',
  
  // Phase 4: Comprehensive Testing and Validation
  UNIT_DIRECTIVE_TESTING = 'unit_directive_testing',
  SYSTEM_E2E_TESTING = 'system_e2e_testing',
  CRITICAL_WORKFLOW_TESTING = 'critical_workflow_testing',
  REGULATORY_VALIDATION = 'regulatory_validation',
  SECURITY_TESTING = 'security_testing',
  DATA_VALIDATION = 'data_validation',
  LOAD_PERFORMANCE_TESTING = 'load_performance_testing',
  UX_USABILITY_ACCESSIBILITY_TESTING = 'ux_usability_accessibility_testing',
  OBSERVABILITY_ANALYTICS_TESTING = 'observability_analytics_testing',
  SERVICE_SUPPORT_TOOLS_TESTING = 'service_support_tools_testing',
  TEST_REPORTS = 'test_reports',
  RISK_FMEA_REPORTS = 'risk_fmea_reports',
  PROGRESS_BUG_REPORTS_KPIS = 'progress_bug_reports_kpis',
  
  // Phase 5: Deployment and Operational Readiness
  TRAINING_SERVICE_READINESS = 'training_service_readiness',
  RELEASE_PLAN_INTERNAL_FIELD_PLANNED_BROAD = 'release_plan_internal_field_planned_broad',
  PRODUCTION_MONITORING = 'production_monitoring',
  METRIC_RECORDING_IMPROVEMENT_OPS = 'metric_recording_improvement_ops',
  DEPLOYMENT_STATE_MAPPING = 'deployment_state_mapping',
  COMPLETE_SERVICE_DEPLOYMENT_ORCHESTRATION = 'complete_service_deployment_orchestration',
  DEPLOYMENT_PLAN_REPORTS = 'deployment_plan_reports',
  PRODUCTION_DOCUMENTATION_REVIEWS_ARCHIVES = 'production_documentation_reviews_archives',
  OPERATIONAL_READINESS_ENVIRONMENT_VALIDATION = 'operational_readiness_environment_validation',
  TECHNICAL_COMMERCIAL_RELEASE_NOTES = 'technical_commercial_release_notes'
}

@Entity('workflow_tasks')
export class WorkflowTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  taskType: PhaseTask;

  @Column({ type: 'varchar', length: 20 })
  status: TaskStatus;

  @Column({ type: 'varchar', length: 20 })
  priority: TaskPriority;

  @Column({ type: 'uuid' })
  phaseId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  integrations: Record<string, any> | null;

  @ManyToOne(() => WorkflowPhase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phaseId' })
  phase: WorkflowPhase;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Get status color
  get statusColor(): string {
    const colors = {
      [TaskStatus.TODO]: 'gray',
      [TaskStatus.IN_PROGRESS]: 'blue',
      [TaskStatus.IN_REVIEW]: 'purple',
      [TaskStatus.COMPLETED]: 'green',
      [TaskStatus.BLOCKED]: 'red'
    };
    return colors[this.status] || 'gray';
  }

  // Get priority color
  get priorityColor(): string {
    const colors = {
      [TaskPriority.LOW]: 'green',
      [TaskPriority.MEDIUM]: 'blue',
      [TaskPriority.HIGH]: 'orange',
      [TaskPriority.CRITICAL]: 'red'
    };
    return colors[this.priority] || 'gray';
  }
}
