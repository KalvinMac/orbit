import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { User } from './User';

export enum GoalStatus {
    NOT_STARTED = 'not_started',
    ON_TRACK = 'on_track',
    AT_RISK = 'at_risk',
    OFF_TRACK = 'off_track',
    COMPLETED = 'completed'
}

registerEnumType(GoalStatus, {
    name: 'GoalStatus',
    description: 'Status of the strategic goal',
});

@ObjectType()
@Entity('strategic_goals')
export class StrategicGoal {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    title: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    description: string;

    @Field(() => GoalStatus)
    @Column({ type: 'varchar', default: GoalStatus.NOT_STARTED })
    status: GoalStatus;

    @Field(() => [User], { nullable: true })
    @ManyToMany(() => User)
    @JoinTable({
        name: 'strategic_goal_owners',
        joinColumn: { name: 'goalId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
    })
    owners: User[];

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
