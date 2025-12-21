import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { Notification } from '../entities/Notification';
import { AppDataSource } from '../config/data-source';

@Resolver()
export class NotificationResolver {
    private notificationRepository = AppDataSource.getRepository(Notification);

    @Query(() => [Notification])
    async getNotifications(@Arg('userId', { nullable: true }) userId?: string): Promise<Notification[]> {
        // If userId is provided, filter by it. otherwise return the latest global ones (or just empty for safety, but let's be generous for demo)
        const where = userId ? { recipientId: userId } : {};
        return this.notificationRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: 20
        });
    }

    @Mutation(() => Boolean)
    async markNotificationRead(@Arg('id', () => ID) id: string): Promise<boolean> {
        const result = await this.notificationRepository.update(id, { read: true });
        return result.affected !== 0;
    }

    // Helper method for other resolvers to use if they import this class or we can just use repository directly
    static async createNotification(
        message: string,
        type: string,
        recipientId: string | null = null,
        relatedEntityId: string | null = null,
        relatedEntityType: string | null = null
    ) {
        const repo = AppDataSource.getRepository(Notification);
        const notification = repo.create({
            message,
            type,
            recipientId: recipientId || undefined, // undefined will likely be null in DB if column is nullable
            relatedEntityId: relatedEntityId || undefined,
            relatedEntityType: relatedEntityType || undefined,
            read: false
        });
        await repo.save(notification);
    }
}
