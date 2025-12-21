import { Resolver, Query, Mutation, Arg, Int, InputType, Field } from 'type-graphql';
import { Project, ProjectStatus } from '../entities/Project';
import { AppDataSource } from '../config/data-source';
import { NotificationResolver } from './NotificationResolver';

@InputType()
class CreateProjectInput {
    @Field()
    name: string;

    @Field()
    description: string;

    @Field()
    ownerId: string;

    @Field({ nullable: true })
    objectiveId?: string;

    @Field({ nullable: true })
    dvfId?: string;
}

@InputType()
class UpdateProjectInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    status?: string; // Accept string for flexible case handling

    @Field(() => Int, { nullable: true })
    progress?: number;

    @Field({ nullable: true })
    startDate?: Date;

    @Field({ nullable: true })
    targetEndDate?: Date;

    @Field({ nullable: true })
    ownerId?: string;

    @Field({ nullable: true })
    leadId?: string;

    @Field({ nullable: true })
    objectiveId?: string;

    @Field({ nullable: true })
    dvfId?: string;
}

@Resolver()
export class ProjectResolver {
    private projectRepository = AppDataSource.getRepository(Project);

    @Query(() => [Project])
    async projects(): Promise<Project[]> {
        return this.projectRepository.find({ relations: ['owner', 'lead'] });
    }

    @Query(() => Project, { nullable: true })
    async project(@Arg('id') id: string): Promise<Project | null> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) return null;
        return this.projectRepository.findOne({
            where: { id },
            relations: [
                'owner',
                'lead',
                'objective',
                'dvf',
                'workflowPhases',
                'workflowPhases.tasks',
                'qualityManagement'
            ],
            order: {
                workflowPhases: {
                    createdAt: 'ASC' // Or some order
                }
            }
        }) || null;
    }

    @Mutation(() => Project)
    async createProject(@Arg('data') data: CreateProjectInput): Promise<Project> {
        const project = this.projectRepository.create({
            ...data,
            status: ProjectStatus.PLANNING,
            objectiveId: data.objectiveId || undefined,
            dvfId: data.dvfId || undefined
        });
        const savedProject = await this.projectRepository.save(project);

        try {
            await NotificationResolver.createNotification(
                `Project "${savedProject.name}" has been created.`,
                'info',
                savedProject.ownerId,
                savedProject.id,
                'project'
            );
        } catch (error) {
            console.error('Failed to create notification:', error);
        }

        return savedProject;
    }

    @Mutation(() => Project)
    async updateProject(
        @Arg('id') id: string,
        @Arg('data') data: UpdateProjectInput
    ): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { id } });
        if (!project) throw new Error('Project not found');

        if (data.name !== undefined) project.name = data.name;
        if (data.description !== undefined) project.description = data.description;

        // Robust status handling: case-insensitive mapping to Enum
        if (data.status !== undefined) {
            const normalizedStatus = data.status.toUpperCase();
            if (Object.values(ProjectStatus).includes(normalizedStatus as ProjectStatus)) {
                project.status = normalizedStatus as ProjectStatus;
            }
        }

        if (data.progress !== undefined) project.progress = data.progress;
        if (data.startDate !== undefined) project.startDate = data.startDate;
        if (data.targetEndDate !== undefined) project.targetEndDate = data.targetEndDate;
        if (data.ownerId !== undefined) project.ownerId = data.ownerId;
        if (data.leadId !== undefined) project.leadId = data.leadId;
        if (data.objectiveId !== undefined) project.objectiveId = data.objectiveId || null;
        if (data.dvfId !== undefined) project.dvfId = data.dvfId || null;

        const updatedProject = await this.projectRepository.save(project);

        try {
            await NotificationResolver.createNotification(
                `Project "${updatedProject.name}" has been updated.`,
                'info',
                updatedProject.ownerId,
                updatedProject.id,
                'project'
            );
        } catch (error) {
            console.error('Failed to create notification:', error);
        }

        return updatedProject;
    }

    @Mutation(() => Boolean)
    async deleteProject(@Arg('id') id: string): Promise<boolean> {
        const project = await this.projectRepository.findOne({ where: { id } });
        if (project) {
            try {
                await NotificationResolver.createNotification(
                    `Project "${project.name}" has been deleted.`,
                    'warning',
                    project.ownerId,
                    null,
                    'project'
                );
            } catch (error) {
                console.error('Failed to create notification:', error);
            }
        }
        const result = await this.projectRepository.delete(id);
        return result.affected !== 0;
    }
}

