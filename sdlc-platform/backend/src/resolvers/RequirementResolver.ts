import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Requirement, RequirementStatus, RequirementType } from '../entities/Requirement';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class RequirementResolver {
    private requirementRepository = AppDataSource.getRepository(Requirement);

    @Query(() => [Requirement])
    async requirements(): Promise<Requirement[]> {
        return this.requirementRepository.find({ relations: ['project', 'createdBy', 'assignedTo'] });
    }

    @Query(() => Requirement, { nullable: true })
    async requirement(@Arg('id') id: string): Promise<Requirement | null> {
        return this.requirementRepository.findOne({ where: { id }, relations: ['project', 'createdBy', 'assignedTo'] });
    }

    @Query(() => [Requirement])
    async requirementsByProject(@Arg('projectId') projectId: string): Promise<Requirement[]> {
        return this.requirementRepository.find({
            where: { projectId },
            relations: ['project', 'createdBy', 'assignedTo']
        });
    }

    @Mutation(() => Requirement)
    async createRequirement(
        @Arg('title') title: string,
        @Arg('description') description: string,
        @Arg('projectId') projectId: string,
        @Arg('createdById') createdById: string,
        @Arg('type', () => String, { nullable: true }) type?: string,
        @Arg('priority', { nullable: true }) priority?: 'low' | 'medium' | 'high' | 'critical',
        @Arg('assignedToId', { nullable: true }) assignedToId?: string,
        @Arg('jiraLink', { nullable: true }) jiraLink?: string,
        @Arg('category', { nullable: true }) category?: string
    ): Promise<Requirement> {
        const requirement = this.requirementRepository.create({
            title,
            description,
            projectId,
            createdById,
            type: (type as RequirementType) || RequirementType.FUNCTIONAL,
            priority: priority || 'medium',
            status: RequirementStatus.DRAFT,
            assignedToId,
            jiraLink,
            category
        });
        return this.requirementRepository.save(requirement);
    }

    @Mutation(() => Requirement)
    async updateRequirement(
        @Arg('id') id: string,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('status', () => String, { nullable: true }) status?: string,
        @Arg('type', () => String, { nullable: true }) type?: string,
        @Arg('priority', { nullable: true }) priority?: 'low' | 'medium' | 'high' | 'critical',
        @Arg('assignedToId', { nullable: true }) assignedToId?: string,
        @Arg('jiraLink', { nullable: true }) jiraLink?: string,
        @Arg('category', { nullable: true }) category?: string
    ): Promise<Requirement> {

        const requirement = await this.requirementRepository.findOne({ where: { id } });
        if (!requirement) throw new Error('Requirement not found');

        if (title !== undefined) requirement.title = title;
        if (description !== undefined) requirement.description = description;
        if (status !== undefined) requirement.status = status as RequirementStatus;
        if (type !== undefined) requirement.type = type as RequirementType;
        if (priority !== undefined) requirement.priority = priority;
        if (assignedToId !== undefined) requirement.assignedToId = assignedToId;
        if (jiraLink !== undefined) requirement.jiraLink = jiraLink;
        if (category !== undefined) requirement.category = category;

        return this.requirementRepository.save(requirement);
    }

    @Mutation(() => Boolean)
    async deleteRequirement(@Arg('id') id: string): Promise<boolean> {
        const result = await this.requirementRepository.delete(id);
        return result.affected !== 0;
    }
}
