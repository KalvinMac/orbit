import { Resolver, Mutation, Arg, ID, Query } from 'type-graphql';
import { QualityManagement, QMPhase, QMStatus } from '../entities/QualityManagement';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class QualityResolver {
    private qmRepository = AppDataSource.getRepository(QualityManagement);

    @Query(() => [QualityManagement])
    async getProjectQualityGates(@Arg('projectId', () => ID) projectId: string): Promise<QualityManagement[]> {
        // Return in a specific order if needed, essentially Phase enum order
        const qms = await this.qmRepository.find({ where: { projectId } });
        // Sort by predefined order
        const order = Object.values(QMPhase);
        return qms.sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase));
    }

    @Mutation(() => [QualityManagement])
    async initializeQualityGates(@Arg('projectId', () => ID) projectId: string): Promise<QualityManagement[]> {
        const existing = await this.qmRepository.find({ where: { projectId } });
        if (existing.length > 0) throw new Error('Quality Gates already initialized for this project');

        const phases = Object.values(QMPhase);
        const gates: QualityManagement[] = [];

        // Define default deliverables for each phase
        const defaultDeliverables: Record<string, any> = {
            [QMPhase.BUILDING_PHASE]: {
                building_phase_design_inputs: { completed: false, link: '' },
                building_phase_trace: { completed: false, link: '' }
            },
            [QMPhase.QA]: {
                qa_architecture_patterns_spec: { completed: false, link: '' },
                qa_integration_document: { completed: false, link: '' },
                qa_ttp: { completed: false, link: '' }
            },
            [QMPhase.UAT]: {
                uat_acceptance_test_plan: { completed: false, link: '' }
            },
            [QMPhase.SQA_SQCT]: {
                sqa_sqct_test_case: { completed: false, link: '' },
                sqa_sqct_test_reports: { completed: false, link: '' },
                sqa_sqct_gxp: { completed: false, link: '' }
            },
            [QMPhase.ENVIRONMENT_RECORD]: {
                environment_record_dvsrs: { completed: false, link: '' },
                environment_record_urs_records: { completed: false, link: '' }
            }
        };

        for (const phase of phases) {
            const gate = this.qmRepository.create({
                projectId,
                phase,
                status: QMStatus.NOT_STARTED,
                deliverables: defaultDeliverables[phase] || {},
                // responsibleUser? leave null for now
            });
            gates.push(await this.qmRepository.save(gate));
        }

        return gates;
    }

    @Mutation(() => QualityManagement)
    async updateQualityGate(
        @Arg('id', () => ID) id: string,
        @Arg('status', () => String, { nullable: true }) status?: string,
        @Arg('deliverablesJSON', () => String, { nullable: true }) deliverablesJSON?: string,
        @Arg('notes', { nullable: true }) notes?: string
    ): Promise<QualityManagement> {
        const gate = await this.qmRepository.findOne({ where: { id } });
        if (!gate) throw new Error('Quality Gate not found');

        if (status) gate.status = status as QMStatus;
        if (notes !== undefined) gate.notes = notes;
        if (deliverablesJSON) {
            try {
                gate.deliverables = JSON.parse(deliverablesJSON);
            } catch (e) {
                throw new Error('Invalid JSON for deliverables');
            }
        }

        return this.qmRepository.save(gate);
    }
}
