import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from './User';

@ObjectType()
@Entity('notifications')
export class Notification {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    message: string;

    @Field()
    @Column({ default: 'info' })
    type: string; // info, success, warning, error

    @Field()
    @Column({ default: false })
    read: boolean;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    relatedEntityId?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    relatedEntityType?: string; // project, requirement, etc.

    @Field(() => User, { nullable: true }) // Nullable because system notifications might not have a single recipient? Or simpler: always link to a user. For now, let's say it's for a specific user.
    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })  // Nullable for "broadcast" notifications potentially, but let's stick to user-specific for now.
    @JoinColumn({ name: 'recipientId' })
    recipient: User;

    @Column({ nullable: true })
    recipientId: string;

    @Field()
    @CreateDateColumn()
    createdAt: Date;
}
