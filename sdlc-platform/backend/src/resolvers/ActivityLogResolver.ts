import { Resolver, Query, ObjectType, Field, ID, Arg } from 'type-graphql';
import { AppDataSource } from '../config/data-source';
import { Project } from '../entities/Project';
import { WorkflowTask } from '../entities/WorkflowTask';
import { StrategicGoal } from '../entities/StrategicGoal';
import { DVF } from '../entities/DVF';

@ObjectType()
class ActivityLogItem {
    @Field(() => ID)
    id: string;

    @Field()
    entityType: string;

    @Field()
    entityId: string;

    @Field()
    title: string;

    @Field()
    action: string;

    @Field()
    timestamp: Date;

    @Field(() => String, { nullable: true })
    user: string | null;

    @Field(() => String, { nullable: true })
    status: string | null;
}

@Resolver()
export class ActivityLogResolver {
    private projectRepo = AppDataSource.getRepository(Project);
    private taskRepo = AppDataSource.getRepository(WorkflowTask);
    private goalRepo = AppDataSource.getRepository(StrategicGoal);
    private dvfRepo = AppDataSource.getRepository(DVF);

    @Query(() => [ActivityLogItem])
    async getRecentActivities(@Arg('limit', { defaultValue: 20 }) limit: number): Promise<ActivityLogItem[]> {
        // Fetch recent updates from all tracked entities
        const [projects, tasks, goals, dvfs] = await Promise.all([
            this.projectRepo.find({ order: { updatedAt: 'DESC' }, take: limit, relations: ['owner'] }),
            this.taskRepo.find({ order: { updatedAt: 'DESC' }, take: limit, relations: ['assignedTo'] }),
            this.goalRepo.find({ order: { updatedAt: 'DESC' }, take: limit, relations: ['owners'] }),
            this.dvfRepo.find({ order: { updatedAt: 'DESC' }, take: limit, relations: ['createdBy'] })
        ]);

        const activities: ActivityLogItem[] = [];

        activities.push(...projects.map(p => ({
            id: `proj_${p.id}`,
            entityType: 'Project',
            entityId: p.id,
            title: p.name,
            action: p.createdAt.getTime() === p.updatedAt.getTime() ? 'Created' : 'Updated',
            timestamp: p.updatedAt,
            user: p.owner ? `${p.owner.firstName} ${p.owner.lastName}` : 'System',
            status: p.status
        })));

        activities.push(...tasks.map(t => ({
            id: `task_${t.id}`,
            entityType: 'Task',
            entityId: t.id,
            title: t.title,
            action: t.createdAt.getTime() === t.updatedAt.getTime() ? 'Created' : 'Updated',
            timestamp: t.updatedAt,
            user: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'System',
            status: t.status
        })));

        activities.push(...goals.map(g => ({
            id: `goal_${g.id}`,
            entityType: 'Strategic Goal',
            entityId: g.id,
            title: g.title,
            action: g.createdAt.getTime() === g.updatedAt.getTime() ? 'Created' : 'Updated',
            timestamp: g.updatedAt,
            user: g.owners && g.owners.length > 0 ? `${g.owners[0].firstName} ${g.owners[0].lastName}` : 'System',
            status: g.status
        })));

        activities.push(...dvfs.map(d => ({
            id: `dvf_${d.id}`,
            entityType: 'DVF',
            entityId: d.id,
            title: d.title,
            action: d.createdAt.getTime() === d.updatedAt.getTime() ? 'Created' : 'Updated',
            timestamp: d.updatedAt,
            user: d.createdBy ? `${d.createdBy.firstName} ${d.createdBy.lastName}` : 'System',
            status: d.status
        })));

        // collaborative sort and limit
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
}
