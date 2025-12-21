import { Resolver, Query, Arg, ObjectType, Field } from 'type-graphql';
import { AppDataSource } from '../config/data-source';
import { Project } from '../entities/Project';
import { Requirement } from '../entities/Requirement';
import { TestCase } from '../entities/TestCase';
import { Deployment } from '../entities/Deployment';
import { User } from '../entities/User';

@ObjectType()
class SearchResult {
    @Field()
    id: string;

    @Field()
    type: string; // 'Project', 'Requirement', 'TestCase', 'Deployment', 'User'

    @Field()
    title: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    url?: string; // Optional: URL to navigate to (e.g. /projects/1)
}

@Resolver()
export class SearchResolver {
    @Query(() => [SearchResult])
    async search(@Arg('query') query: string): Promise<SearchResult[]> {
        if (!query || query.length < 2) return [];

        const term = `%${query}%`;
        const results: SearchResult[] = [];

        // 1. Projects
        const projects = await AppDataSource.getRepository(Project)
            .createQueryBuilder('project')
            .where('project.name ILIKE :term OR project.description ILIKE :term', { term })
            .getMany();

        projects.forEach(p => results.push({
            id: p.id,
            type: 'Project',
            title: p.name,
            description: p.description || undefined,
            url: `/projects/${p.id}`
        }));

        // 2. Requirements
        const requirements = await AppDataSource.getRepository(Requirement)
            .createQueryBuilder('req')
            .where('req.title ILIKE :term OR req.description ILIKE :term', { term })
            .getMany();

        requirements.forEach(r => results.push({
            id: r.id,
            type: 'Requirement',
            title: r.title,
            description: r.description,
            url: `/requirements/${r.id}` // Assuming detail view exists, otherwise list view
        }));

        // 3. Test Cases
        const testCases = await AppDataSource.getRepository(TestCase)
            .createQueryBuilder('tc')
            .where('tc.title ILIKE :term OR tc.description ILIKE :term', { term })
            .getMany();

        testCases.forEach(t => results.push({
            id: t.id,
            type: 'TestCase',
            title: t.title,
            description: t.description,
            url: `/test-cases/${t.id}`
        }));

        // 4. Deployments
        const deployments = await AppDataSource.getRepository(Deployment)
            .createQueryBuilder('dep')
            .where('dep.version ILIKE :term OR dep.environment ILIKE :term', { term })
            .getMany();

        deployments.forEach(d => results.push({
            id: d.id,
            type: 'Deployment',
            title: `${d.environment} - ${d.version}`,
            description: `Status: ${d.status}`,
            url: `/deployments` // Deployment usually just list
        }));

        // 5. Users
        const users = await AppDataSource.getRepository(User)
            .createQueryBuilder('user')
            .where('user.firstName ILIKE :term OR user.lastName ILIKE :term OR user.email ILIKE :term', { term })
            .getMany();

        users.forEach(u => results.push({
            id: u.id,
            type: 'User',
            title: `${u.firstName} ${u.lastName}`,
            description: u.email,
            url: `/settings` // or profile
        }));

        return results.slice(0, 20); // Limit to top 20
    }
}
