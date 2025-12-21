import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { TestCase, TestStatus, TestType } from '../entities/TestCase';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class TestCaseResolver {
    private testCaseRepository = AppDataSource.getRepository(TestCase);

    @Query(() => [TestCase])
    async testCases(): Promise<TestCase[]> {
        return this.testCaseRepository.find({ relations: ['project', 'requirement', 'createdBy', 'assignedTo'] });
    }

    @Query(() => TestCase, { nullable: true })
    async testCase(@Arg('id') id: string): Promise<TestCase | null> {
        return this.testCaseRepository.findOne({ where: { id }, relations: ['project', 'requirement', 'createdBy', 'assignedTo'] });
    }

    @Query(() => [TestCase])
    async testCasesByProject(@Arg('projectId') projectId: string): Promise<TestCase[]> {
        return this.testCaseRepository.find({
            where: { projectId },
            relations: ['project', 'requirement', 'createdBy', 'assignedTo']
        });
    }

    @Mutation(() => TestCase)
    async createTestCase(
        @Arg('title') title: string,
        @Arg('description') description: string,
        @Arg('projectId') projectId: string,
        @Arg('createdById') createdById: string,
        @Arg('steps', { nullable: true }) steps?: string,
        @Arg('expectedResults', { nullable: true }) expectedResults?: string,
        @Arg('type', () => String, { nullable: true }) type?: string,
        @Arg('priority', { nullable: true }) priority?: 'low' | 'medium' | 'high' | 'critical',
        @Arg('prerequisites', { nullable: true }) prerequisites?: string,
        @Arg('requirementId', { nullable: true }) requirementId?: string,
        @Arg('assignedToId', { nullable: true }) assignedToId?: string,
        @Arg('jiraLink', { nullable: true }) jiraLink?: string,
        @Arg('category', { nullable: true }) category?: string
    ): Promise<TestCase> {
        const testCase = this.testCaseRepository.create({
            title,
            description,
            steps: steps || '',
            expectedResults: expectedResults || '',
            projectId,
            createdById,
            type: (type as TestType) || TestType.UNIT,
            priority: priority || 'medium',
            status: TestStatus.DRAFT,
            prerequisites: prerequisites || '',
            requirementId,
            assignedToId,
            jiraLink,
            category
        });
        return this.testCaseRepository.save(testCase);
    }

    @Mutation(() => TestCase)
    async updateTestCase(
        @Arg('id') id: string,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('steps', { nullable: true }) steps?: string,
        @Arg('expectedResults', { nullable: true }) expectedResults?: string,
        @Arg('status', () => String, { nullable: true }) status?: string,
        @Arg('type', () => String, { nullable: true }) type?: string,
        @Arg('priority', { nullable: true }) priority?: 'low' | 'medium' | 'high' | 'critical',
        @Arg('prerequisites', { nullable: true }) prerequisites?: string,
        @Arg('requirementId', { nullable: true }) requirementId?: string,
        @Arg('assignedToId', { nullable: true }) assignedToId?: string,
        @Arg('isAutomated', { nullable: true }) isAutomated?: boolean,
        @Arg('automationScript', { nullable: true }) automationScript?: string,
        @Arg('jiraLink', { nullable: true }) jiraLink?: string,
        @Arg('category', { nullable: true }) category?: string
    ): Promise<TestCase> {
        const testCase = await this.testCaseRepository.findOne({ where: { id } });
        if (!testCase) throw new Error('TestCase not found');

        if (title !== undefined) testCase.title = title;
        if (description !== undefined) testCase.description = description;
        if (steps !== undefined) testCase.steps = steps;
        if (expectedResults !== undefined) testCase.expectedResults = expectedResults;
        if (status !== undefined) testCase.status = status as TestStatus;
        if (type !== undefined) testCase.type = type as TestType;
        if (priority !== undefined) testCase.priority = priority;
        if (prerequisites !== undefined) testCase.prerequisites = prerequisites;
        if (requirementId !== undefined) testCase.requirementId = requirementId;
        if (assignedToId !== undefined) testCase.assignedToId = assignedToId;
        if (isAutomated !== undefined) testCase.isAutomated = isAutomated;
        if (automationScript !== undefined) testCase.automationScript = automationScript;
        if (jiraLink !== undefined) testCase.jiraLink = jiraLink;
        if (category !== undefined) testCase.category = category;

        return this.testCaseRepository.save(testCase);
    }

    @Mutation(() => Boolean)
    async deleteTestCase(@Arg('id') id: string): Promise<boolean> {
        const result = await this.testCaseRepository.delete(id);
        return result.affected !== 0;
    }
}
