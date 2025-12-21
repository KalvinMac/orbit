import { Resolver, Query, Mutation, Arg, InputType, Field, ID } from 'type-graphql';
import { DVF, DVFStatus } from '../entities/DVF';
import { AppDataSource } from '../config/data-source';

@InputType()
class CreateDVFInput {
    @Field()
    title: string;

    @Field({ nullable: true })
    description: string;

    @Field({ nullable: true })
    desirability: string;

    @Field({ nullable: true })
    viability: string;

    @Field({ nullable: true })
    feasibility: string;



    @Field(() => ID)
    createdById: string;
}

@InputType()
class UpdateDVFInput {
    @Field({ nullable: true })
    title?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    desirability?: string;

    @Field({ nullable: true })
    viability?: string;

    @Field({ nullable: true })
    feasibility?: string;

    @Field(() => DVFStatus, { nullable: true })
    status?: DVFStatus;

    @Field(() => ID, { nullable: true })
    createdById?: string;
}

@Resolver()
export class DVFResolver {
    private dvfRepository = AppDataSource.getRepository(DVF);

    @Query(() => [DVF])
    async getDVFs(): Promise<DVF[]> {
        return this.dvfRepository.find({
            relations: ['projects', 'projects.owner', 'createdBy'],
            order: { createdAt: 'DESC' }
        });
    }

    @Query(() => DVF, { nullable: true })
    async getDVF(@Arg('id', () => ID) id: string): Promise<DVF | null> {
        return this.dvfRepository.findOne({
            where: { id },
            relations: ['projects', 'projects.owner', 'createdBy']
        });
    }

    @Mutation(() => DVF)
    async createDVF(@Arg('data') data: CreateDVFInput): Promise<DVF> {
        const dvf = this.dvfRepository.create({
            ...data,
            status: DVFStatus.DRAFT
        });
        return this.dvfRepository.save(dvf);
    }

    @Mutation(() => DVF)
    async updateDVF(
        @Arg('id', () => ID) id: string,
        @Arg('data') data: UpdateDVFInput
    ): Promise<DVF> {
        const dvf = await this.dvfRepository.findOne({ where: { id } });
        if (!dvf) {
            throw new Error('DVF not found');
        }

        if (data.title !== undefined) dvf.title = data.title;
        if (data.description !== undefined) dvf.description = data.description;
        if (data.desirability !== undefined) dvf.desirability = data.desirability;
        if (data.viability !== undefined) dvf.viability = data.viability;
        if (data.feasibility !== undefined) dvf.feasibility = data.feasibility;
        if (data.status !== undefined) dvf.status = data.status;
        if (data.createdById !== undefined) dvf.createdById = data.createdById;

        return this.dvfRepository.save(dvf);
    }

    @Mutation(() => Boolean)
    async deleteDVF(@Arg('id', () => ID) id: string): Promise<boolean> {
        const result = await this.dvfRepository.delete(id);
        return result.affected !== 0;
    }
}
