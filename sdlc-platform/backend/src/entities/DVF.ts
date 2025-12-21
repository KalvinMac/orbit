import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Project } from './Project';
import { User } from './User';

export enum DVFStatus {
    DRAFT = 'draft',
    IN_REVIEW = 'in_review',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

registerEnumType(DVFStatus, {
    name: 'DVFStatus',
    description: 'The status of the Desirability, Viability, and Feasibility (DVF) assessment',
});

@ObjectType()
@Entity('dvfs')
export class DVF {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    title: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Field(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    desirability: string | null;

    @Field(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    viability: string | null;

    @Field(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    feasibility: string | null;

    @Field(() => DVFStatus)
    @Column({
        type: 'varchar',
        length: 20,
        default: DVFStatus.DRAFT
    })
    status: DVFStatus;

    @Field(() => [Project], { nullable: true })
    @OneToMany(() => Project, (project) => project.dvf)
    projects: Project[];

    @Field(() => ID)
    @Column({ type: 'uuid' })
    createdById: string;

    @Field(() => User)
    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
