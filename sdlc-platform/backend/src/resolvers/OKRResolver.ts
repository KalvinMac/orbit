import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { StrategicGoal, GoalStatus } from '../entities/StrategicGoal';
import { Objective } from '../entities/Objective';
import { KeyResult } from '../entities/KeyResult';
import { User } from '../entities/User';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class OKRResolver {
    private goalRepo = AppDataSource.getRepository(StrategicGoal);
    private objectiveRepo = AppDataSource.getRepository(Objective);
    private keyResultRepo = AppDataSource.getRepository(KeyResult);

    // --- Strategic Goals ---
    @Query(() => [StrategicGoal])
    async strategicGoals(): Promise<StrategicGoal[]> {
        return this.goalRepo.find({ relations: ['owners'], order: { createdAt: 'DESC' } });
    }

    @Mutation(() => StrategicGoal)
    async createStrategicGoal(
        @Arg('title') title: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('ownerIds', () => [String], { nullable: true }) ownerIds?: string[]
    ): Promise<StrategicGoal> {
        let owners: User[] = [];
        if (ownerIds && ownerIds.length > 0) {
            owners = await AppDataSource.getRepository(User).findByIds(ownerIds);
        }
        const goal = this.goalRepo.create({ title, description, owners });
        return this.goalRepo.save(goal);
    }

    @Mutation(() => StrategicGoal)
    async updateStrategicGoal(
        @Arg('id') id: string,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('status', { nullable: true }) status?: string,
        @Arg('ownerIds', () => [String], { nullable: true }) ownerIds?: string[]
    ): Promise<StrategicGoal> {
        const goal = await this.goalRepo.findOne({ where: { id }, relations: ['owners'] });
        if (!goal) throw new Error('Strategic Goal not found');

        if (title !== undefined) goal.title = title;
        if (description !== undefined) goal.description = description;
        if (status !== undefined) goal.status = status as GoalStatus;
        if (ownerIds !== undefined) {
            goal.owners = await AppDataSource.getRepository(User).findByIds(ownerIds);
        }

        return this.goalRepo.save(goal);
    }

    @Mutation(() => Boolean)
    async deleteStrategicGoal(@Arg('id') id: string): Promise<boolean> {
        const result = await this.goalRepo.delete(id);
        return result.affected !== 0;
    }

    // --- Objectives ---
    @Query(() => [Objective])
    async objectives(@Arg('goalId', { nullable: true }) goalId?: string): Promise<Objective[]> {
        const where = goalId ? { strategicGoalId: goalId } : {};
        return this.objectiveRepo.find({ where, relations: ['keyResults', 'projects', 'owners'], order: { createdAt: 'DESC' } });
    }

    @Mutation(() => Objective)
    async createObjective(
        @Arg('title') title: string,
        @Arg('strategicGoalId') strategicGoalId: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('cycle', { nullable: true }) cycle?: string,
        @Arg('ownerIds', () => [String], { nullable: true }) ownerIds?: string[],
        @Arg('status', { nullable: true }) status?: string
    ): Promise<Objective> {
        let owners: User[] = [];
        if (ownerIds && ownerIds.length > 0) {
            owners = await AppDataSource.getRepository(User).findByIds(ownerIds);
        }
        // status defaults to 'not_started' via database default if undefined
        const objective = this.objectiveRepo.create({
            title,
            strategicGoalId,
            description,
            cycle,
            owners,
            status: status || 'not_started'
        });
        return this.objectiveRepo.save(objective);
    }

    @Mutation(() => Objective)
    async updateObjective(
        @Arg('id') id: string,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('cycle', { nullable: true }) cycle?: string,
        @Arg('ownerIds', () => [String], { nullable: true }) ownerIds?: string[],
        @Arg('status', { nullable: true }) status?: string
    ): Promise<Objective> {
        const objective = await this.objectiveRepo.findOne({ where: { id }, relations: ['owners'] });
        if (!objective) throw new Error('Objective not found');

        if (title !== undefined) objective.title = title;
        if (description !== undefined) objective.description = description;
        if (cycle !== undefined) objective.cycle = cycle;
        if (status !== undefined) objective.status = status;
        if (ownerIds !== undefined) {
            objective.owners = await AppDataSource.getRepository(User).findByIds(ownerIds);
        }

        return this.objectiveRepo.save(objective);
    }

    @Mutation(() => Boolean)
    async deleteObjective(@Arg('id') id: string): Promise<boolean> {
        const result = await this.objectiveRepo.delete(id);
        return result.affected !== 0;
    }

    // --- Key Results ---
    @Mutation(() => KeyResult)
    async createKeyResult(
        @Arg('title') title: string,
        @Arg('objectiveId') objectiveId: string,
        @Arg('targetValue') targetValue: number,
        @Arg('startValue', { defaultValue: 0 }) startValue: number,
        @Arg('metricType', { defaultValue: 'number' }) metricType: string
    ): Promise<KeyResult> {
        const kr = this.keyResultRepo.create({ title, objectiveId, targetValue, startValue, metricType, currentValue: startValue });
        return this.keyResultRepo.save(kr);
    }

    @Mutation(() => KeyResult)
    async updateKeyResultProgress(
        @Arg('id') id: string,
        @Arg('currentValue') currentValue: number
    ): Promise<KeyResult> {
        const kr = await this.keyResultRepo.findOne({ where: { id } });
        if (!kr) throw new Error('KeyResult not found');
        kr.currentValue = currentValue;
        return this.keyResultRepo.save(kr);
    }
}
