import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { WorkflowPhase } from '../entities/WorkflowPhase';
import { WorkflowTask, TaskStatus, TaskPriority } from '../entities/WorkflowTask';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class WorkflowResolver {
    private phaseRepository = AppDataSource.getRepository(WorkflowPhase);
    private taskRepository = AppDataSource.getRepository(WorkflowTask);

    @Query(() => [WorkflowPhase])
    async getProjectWorkflow(@Arg('projectId', () => ID) projectId: string): Promise<WorkflowPhase[]> {
        return this.phaseRepository.find({
            where: { projectId },
            relations: ['tasks', 'tasks.assignedTo'],
            order: {
                createdAt: 'ASC', // Assuming phases are created in order, or we might need an order field
            },
        });
    }

    @Query(() => [WorkflowTask])
    async getPhaseTasks(@Arg('phaseId', () => ID) phaseId: string): Promise<WorkflowTask[]> {
        return this.taskRepository.find({
            where: { phaseId },
            relations: ['assignedTo'],
            order: {
                createdAt: 'ASC',
            },
        });
    }

    @Query(() => [WorkflowTask])
    async getRecentTasks(@Arg('limit', () => Number, { defaultValue: 5 }) limit: number): Promise<WorkflowTask[]> {
        return this.taskRepository.find({
            relations: ['assignedTo', 'project'],
            order: {
                updatedAt: 'DESC',
            },
            take: limit,
        });
    }

    @Query(() => [WorkflowTask])
    async getCriticalPathTasks(@Arg('limit', () => Number, { defaultValue: 20 }) limit: number): Promise<WorkflowTask[]> {
        // Fetch tasks that are Critical or High priority and not completed
        // Also fetch relations to calculate risk
        return this.taskRepository.find({
            where: [
                { priority: TaskPriority.CRITICAL, status: TaskStatus.IN_PROGRESS },
                { priority: TaskPriority.CRITICAL, status: TaskStatus.TODO },
                { priority: TaskPriority.CRITICAL, status: TaskStatus.BLOCKED },
                { priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS }, // High priority active tasks
            ],
            relations: ['assignedTo', 'project', 'assignedTo.allocations', 'assignedTo.allocations.project'],
            order: {
                dueDate: 'ASC', // Earliest deadline first
                priority: 'DESC' // Critical before High (if enum allows sorting, otherwise handled by query order usually)
            },
            take: limit
        });
    }

    @Query(() => WorkflowTask, { nullable: true })
    async getTask(@Arg('id', () => ID) id: string): Promise<WorkflowTask | null> {
        return this.taskRepository.findOne({ where: { id }, relations: ['assignedTo'] });
    }

    @Query(() => String) // Returning JSON string for simplicity for now, or define an ObjectType
    async getWorkflowMetrics(): Promise<string> {
        // Aggregate progress by phase type across all projects
        // This is a simplified implementation. In a real app, you'd want more complex aggregation.
        const phases = await this.phaseRepository.find();
        const metrics: Record<string, { total: number, count: number }> = {};

        phases.forEach(phase => {
            if (!metrics[phase.phaseType]) {
                metrics[phase.phaseType] = { total: 0, count: 0 };
            }
            // Assuming we can calculate progress for a phase. 
            // For now, let's assume completed = 100, in_progress = 50, not_started = 0
            let progress = 0;
            if (phase.status === 'completed') progress = 100;
            else if (phase.status === 'in_progress') progress = 50;

            metrics[phase.phaseType].total += progress;
            metrics[phase.phaseType].count += 1;
        });

        const result: Record<string, number> = {};
        for (const type in metrics) {
            result[type] = Math.round(metrics[type].total / metrics[type].count);
        }

        return JSON.stringify(result);
    }

    @Mutation(() => WorkflowPhase)
    async createPhase(
        @Arg('projectId', () => ID) projectId: string,
        @Arg('phaseType', () => String) phaseType: string, // Using String to accept PhaseType enum values
        @Arg('status', () => String, { defaultValue: 'not_started' }) status: string,
        @Arg('startDate', { nullable: true }) startDate?: Date,
        @Arg('endDate', { nullable: true }) endDate?: Date,
        @Arg('notes', { nullable: true }) notes?: string
    ): Promise<WorkflowPhase> {
        const phase = this.phaseRepository.create({
            projectId,
            phaseType: phaseType as any,
            status: status as any,
            startDate,
            endDate,
            notes
        });
        return this.phaseRepository.save(phase);
    }

    @Mutation(() => WorkflowPhase)
    async updatePhase(
        @Arg('id', () => ID) id: string,
        @Arg('status', () => String, { nullable: true }) status?: string,
        @Arg('startDate', { nullable: true }) startDate?: Date,
        @Arg('endDate', { nullable: true }) endDate?: Date,
        @Arg('notes', { nullable: true }) notes?: string
    ): Promise<WorkflowPhase> {
        const phase = await this.phaseRepository.findOne({ where: { id } });
        if (!phase) throw new Error('Phase not found');

        if (status !== undefined) phase.status = status as any;
        if (startDate !== undefined) phase.startDate = startDate;
        if (endDate !== undefined) phase.endDate = endDate;
        if (notes !== undefined) phase.notes = notes;

        return this.phaseRepository.save(phase);
    }

    @Mutation(() => Boolean)
    async deletePhase(@Arg('id', () => ID) id: string): Promise<boolean> {
        const result = await this.phaseRepository.delete(id);
        return result.affected !== 0;
    }

    @Mutation(() => WorkflowTask)
    async createTask(
        @Arg('projectId', () => ID) projectId: string,
        @Arg('phaseId', () => ID) phaseId: string,
        @Arg('title') title: string,
        @Arg('taskType', () => String) taskType: string,
        @Arg('status', () => String, { defaultValue: 'todo' }) status: string,
        @Arg('priority', () => String, { defaultValue: 'medium' }) priority: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('assignedToId', () => ID, { nullable: true }) assignedToId?: string,
        @Arg('dueDate', { nullable: true }) dueDate?: Date
    ): Promise<WorkflowTask> {
        const task = this.taskRepository.create({
            projectId,
            phaseId,
            title,
            taskType: taskType as any,
            status: status as TaskStatus,
            priority: priority as TaskPriority,
            description,
            assignedToId,
            dueDate
        });
        return this.taskRepository.save(task);
    }

    @Mutation(() => WorkflowTask)
    async updateTask(
        @Arg('id', () => ID) id: string,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('status', () => String, { nullable: true }) status?: string,
        @Arg('priority', () => String, { nullable: true }) priority?: string,
        @Arg('assignedToId', () => ID, { nullable: true }) assignedToId?: string,
        @Arg('dueDate', { nullable: true }) dueDate?: Date
    ): Promise<WorkflowTask> {
        const task = await this.taskRepository.findOne({ where: { id } });
        if (!task) throw new Error('Task not found');

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status as TaskStatus;
        if (priority !== undefined) task.priority = priority as TaskPriority;
        if (assignedToId !== undefined) task.assignedToId = assignedToId;
        if (dueDate !== undefined) task.dueDate = dueDate;

        return this.taskRepository.save(task);
    }

    @Mutation(() => Boolean)
    async deleteTask(@Arg('id', () => ID) id: string): Promise<boolean> {
        const result = await this.taskRepository.delete(id);
        return result.affected !== 0;
    }
    @Mutation(() => [WorkflowPhase])
    async initializeWorkflow(@Arg('projectId', () => ID) projectId: string): Promise<WorkflowPhase[]> {
        const existing = await this.phaseRepository.find({ where: { projectId } });
        if (existing.length > 0) throw new Error('Workflow already initialized for this project');

        const phases = [
            { type: 'planning', status: 'not_started' },
            { type: 'architecture', status: 'not_started' },
            { type: 'implementation', status: 'not_started' },
            { type: 'testing', status: 'not_started' },
            { type: 'deployment', status: 'not_started' }
        ];

        const createdPhases: WorkflowPhase[] = [];
        for (const p of phases) {
            const phase = this.phaseRepository.create({
                projectId,
                phaseType: p.type,
                status: p.status as any
            });
            createdPhases.push(await this.phaseRepository.save(phase));
        }
        return createdPhases;
    }
}
