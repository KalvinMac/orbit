import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class Integrations {
    @Field()
    github: boolean;

    @Field()
    jira: boolean;

    @Field()
    slack: boolean;

    @Field()
    aws: boolean;
}

@ObjectType()
export class SecuritySettings {
    @Field()
    twoFactorAuth: boolean;

    @Field()
    sso: boolean;

    @Field()
    passwordPolicy: boolean;
}

@ObjectType()
export class NotificationSettings {
    @Field()
    emailDeployment: boolean;

    @Field()
    emailBug: boolean;

    @Field()
    weeklyReport: boolean;
}

@ObjectType()
@Entity('organization_settings')
export class OrganizationSettings {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ default: 'Acme Corp' })
    name: string;

    @Field()
    @Column({ default: 'acme.com' })
    domain: string;

    @Field()
    @Column({ default: 'support@acme.com' })
    supportEmail: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    logoUrl: string;

    @Field()
    @Column({ default: 'admin@acme.com' })
    technicalContact: string;

    @Field(() => Integrations)
    @Column({ type: 'json', default: { github: false, jira: false, slack: false, aws: false } })
    integrations: Integrations;

    @Field(() => SecuritySettings)
    @Column({ type: 'json', default: { twoFactorAuth: false, sso: false, passwordPolicy: true } })
    security: SecuritySettings;

    @Field(() => NotificationSettings)
    @Column({ type: 'json', default: { emailDeployment: true, emailBug: true, weeklyReport: false } })
    notifications: NotificationSettings;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
