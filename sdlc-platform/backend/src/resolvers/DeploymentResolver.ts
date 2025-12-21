import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Deployment, DeploymentStatus, DeploymentType, Environment } from '../entities/Deployment';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class DeploymentResolver {
    private deploymentRepository = AppDataSource.getRepository(Deployment);

    @Query(() => [Deployment])
    async deployments(): Promise<Deployment[]> {
        return this.deploymentRepository.find({ relations: ['project', 'deployedBy', 'approvedBy'] });
    }

    @Query(() => Deployment, { nullable: true })
    async deployment(@Arg('id') id: string): Promise<Deployment | null> {
        return this.deploymentRepository.findOne({ where: { id }, relations: ['project', 'deployedBy', 'approvedBy'] });
    }

    @Query(() => [Deployment])
    async deploymentsByProject(@Arg('projectId') projectId: string): Promise<Deployment[]> {
        return this.deploymentRepository.find({
            where: { projectId },
            relations: ['project', 'deployedBy', 'approvedBy']
        });
    }

    @Mutation(() => Deployment)
    async createDeployment(
        @Arg('name') name: string,
        @Arg('version') version: string,
        @Arg('projectId') projectId: string,
        @Arg('deployedById') deployedById: string,
        @Arg('plannedDate') plannedDate: Date,
        @Arg('type', () => String) type: string,
        @Arg('environment', () => String) environment: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('releaseNotes', { nullable: true }) releaseNotes?: string,
        @Arg('deploymentPlan', { nullable: true }) deploymentPlan?: string,
        @Arg('rollbackPlan', { nullable: true }) rollbackPlan?: string,
        @Arg('links', () => [String], { nullable: true }) links?: string[]
    ): Promise<Deployment> {
        const deployment = this.deploymentRepository.create({
            name,
            version,
            projectId,
            deployedById,
            plannedDate,
            type: type as DeploymentType,
            environment: environment as Environment,
            status: DeploymentStatus.PLANNED,
            description,
            releaseNotes,
            deploymentPlan,
            rollbackPlan,
            links
        });
        return this.deploymentRepository.save(deployment);
    }

    @Mutation(() => Deployment)
    async updateDeployment(
        @Arg('id') id: string,
        @Arg('status', () => String, { nullable: true }) status?: string,
        @Arg('actualStartDate', { nullable: true }) actualStartDate?: Date,
        @Arg('completionDate', { nullable: true }) completionDate?: Date,
        @Arg('approvedById', { nullable: true }) approvedById?: string,
        @Arg('postDeploymentValidation', { nullable: true }) postDeploymentValidation?: string,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('releaseNotes', { nullable: true }) releaseNotes?: string,
        @Arg('links', () => [String], { nullable: true }) links?: string[]
    ): Promise<Deployment> {
        const deployment = await this.deploymentRepository.findOne({ where: { id } });
        if (!deployment) throw new Error('Deployment not found');

        if (status !== undefined) deployment.status = status as DeploymentStatus;
        if (actualStartDate !== undefined) deployment.actualStartDate = actualStartDate;
        if (completionDate !== undefined) deployment.completionDate = completionDate;
        if (approvedById !== undefined) deployment.approvedById = approvedById;
        if (postDeploymentValidation !== undefined) deployment.postDeploymentValidation = postDeploymentValidation;
        if (description !== undefined) deployment.description = description;
        if (releaseNotes !== undefined) deployment.releaseNotes = releaseNotes;
        if (links !== undefined) deployment.links = links;

        return this.deploymentRepository.save(deployment);
    }

    @Mutation(() => Boolean)
    async deleteDeployment(@Arg('id') id: string): Promise<boolean> {
        const result = await this.deploymentRepository.delete(id);
        return result.affected !== 0;
    }
}
