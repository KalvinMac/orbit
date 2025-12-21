import { Resolver, Query, Mutation, Arg, InputType, Field } from 'type-graphql';
import { AppDataSource } from '../config/data-source';
import { OrganizationSettings, Integrations, SecuritySettings, NotificationSettings } from '../entities/OrganizationSettings';

@InputType()
class IntegrationsInput {
    @Field({ nullable: true })
    github?: boolean;

    @Field({ nullable: true })
    jira?: boolean;

    @Field({ nullable: true })
    slack?: boolean;

    @Field({ nullable: true })
    aws?: boolean;
}

@InputType()
class SecuritySettingsInput {
    @Field({ nullable: true })
    twoFactorAuth?: boolean;

    @Field({ nullable: true })
    sso?: boolean;

    @Field({ nullable: true })
    passwordPolicy?: boolean;
}

@InputType()
class NotificationSettingsInput {
    @Field({ nullable: true })
    emailDeployment?: boolean;

    @Field({ nullable: true })
    emailBug?: boolean;

    @Field({ nullable: true })
    weeklyReport?: boolean;
}

@InputType()
class OrganizationSettingsInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    domain?: string;

    @Field({ nullable: true })
    supportEmail?: string;

    @Field({ nullable: true })
    technicalContact?: string;

    @Field({ nullable: true })
    logoUrl?: string;

    @Field(() => IntegrationsInput, { nullable: true })
    integrations?: IntegrationsInput;

    @Field(() => SecuritySettingsInput, { nullable: true })
    security?: SecuritySettingsInput;

    @Field(() => NotificationSettingsInput, { nullable: true })
    notifications?: NotificationSettingsInput;
}

@Resolver()
export class SettingsResolver {
    private settingsRepository = AppDataSource.getRepository(OrganizationSettings);

    @Query(() => OrganizationSettings)
    async getOrganizationSettings(): Promise<OrganizationSettings> {
        const settings = await this.settingsRepository.find();
        if (settings.length > 0) {
            return settings[0];
        }

        // Create default if not exists
        const defaultSettings = this.settingsRepository.create();
        return this.settingsRepository.save(defaultSettings);
    }

    @Mutation(() => OrganizationSettings)
    async updateOrganizationSettings(
        @Arg('input') input: OrganizationSettingsInput
    ): Promise<OrganizationSettings> {
        let settings = await this.settingsRepository.find();
        let setting: OrganizationSettings;

        if (settings.length > 0) {
            setting = settings[0];
        } else {
            setting = this.settingsRepository.create();
        }

        if (input.name !== undefined) setting.name = input.name;
        if (input.domain !== undefined) setting.domain = input.domain;
        if (input.supportEmail !== undefined) setting.supportEmail = input.supportEmail;
        if (input.technicalContact !== undefined) setting.technicalContact = input.technicalContact;
        if (input.logoUrl !== undefined) setting.logoUrl = input.logoUrl;

        if (input.integrations) {
            // Ensure default values if previous value was null/undefined (though schema defaults should handle creation, existing partial updates might be tricky)
            const current = setting.integrations || { github: false, jira: false, slack: false, aws: false };
            setting.integrations = { ...current, ...input.integrations } as Integrations;
        }
        if (input.security) {
            const current = setting.security || { twoFactorAuth: false, sso: false, passwordPolicy: true };
            setting.security = { ...current, ...input.security } as SecuritySettings;
        }
        if (input.notifications) {
            const current = setting.notifications || { emailDeployment: true, emailBug: true, weeklyReport: false };
            setting.notifications = { ...current, ...input.notifications } as NotificationSettings;
        }

        return this.settingsRepository.save(setting);
    }
}
