import { z } from "zod";
import { ObjectId } from "mongodb";
import {
    IdSchema,
    LanguageSchema,
    PersonalBestsSchema,
    PersonalBests,
    StringNumberSchema,
    CountByYearAndDaySchema,
} from "./shared";

/**
 * User Streak Schema
 */

export const UserStreakSchema = z
    .object({
        length: z.number().int().nonnegative(),
        maxLength: z.number().int().nonnegative(),
        lastResultTimestamp: z.number().int().nonnegative(),
        hourOffset: z.number().min(-11).max(12).step(0.5).optional(),
    })
    .strict();
export type UserStreak = z.infer<typeof UserStreakSchema>;

/**
 * User Tag Schema
 */

export const UserTagSchema = z
    .object({
        _id: IdSchema,
        name: z
            .string()
            .regex(/^[0-9a-zA-Z_.-]+$/)
            .max(16),
        personalBests: PersonalBestsSchema,
    })
    .strict();
export type UserTag = z.infer<typeof UserTagSchema>;

/**
 * Social Profiles Schema
 */

export const SocialProfilesSchema = z
    .object({
        twitter: z
            .string()
            .max(20)
            .regex(/^[0-9a-zA-Z_.-]+$/)
            .optional(),
        website: z.string().url().max(200).startsWith("https://").optional(),
    })
    .strict();
export type SocialProfiles = z.infer<typeof SocialProfilesSchema>;

/**
 * User Profile Details Schema
 */

export const UserProfileDetailsSchema = z
    .object({
        bio: z.string().max(250).optional(),
        keyboard: z.string().max(75).optional(),
        socialProfiles: SocialProfilesSchema.optional(),
        showActivityOnPublicProfile: z.boolean().optional(),
    })
    .strict();
export type UserProfileDetails = z.infer<typeof UserProfileDetailsSchema>;

/**
 * Custom Theme Colors Schema
 */

export const CustomThemeColorsSchema = z.object({
    background: z.string(),
    main: z.string(),
    caret: z.string(),
    sub: z.string(),
    text: z.string(),
    error: z.string(),
    errorExtra: z.string(),
    colorfulError: z.string(),
    colorfulErrorExtra: z.string(),
});
export type CustomThemeColors = z.infer<typeof CustomThemeColorsSchema>;

/**
 * Custom Theme Schema
 */

export const CustomThemeSchema = z
    .object({
        _id: IdSchema,
        name: z
            .string()
            .regex(/^[0-9a-zA-Z_-]+$/)
            .max(16),
        colors: CustomThemeColorsSchema,
    })
    .strict();
export type CustomTheme = z.infer<typeof CustomThemeSchema>;

/**
 * Result Filter Preset Schema
 */

export const ResultFilterPresetSchema = z.object({
    _id: IdSchema,
    name: z
        .string()
        .regex(/^[0-9a-zA-Z_.-]+$/)
        .max(16),
    pb: z.object({
        no: z.boolean(),
        yes: z.boolean(),
    }),
    difficulty: z.record(z.string(), z.boolean()),
    mode: z.record(z.string(), z.boolean()),
    words: z.record(z.string(), z.boolean()),
    time: z.record(z.string(), z.boolean()),
    punctuation: z.object({
        on: z.boolean(),
        off: z.boolean(),
    }),
    numbers: z.object({
        on: z.boolean(),
        off: z.boolean(),
    }),
    date: z.object({
        last_day: z.boolean(),
        last_week: z.boolean(),
        last_month: z.boolean(),
        last_3months: z.boolean(),
        all: z.boolean(),
    }),
    tags: z.record(z.string(), z.boolean()),
    language: z.record(z.string(), z.boolean()),
});
export type ResultFilterPreset = z.infer<typeof ResultFilterPresetSchema>;

/**
 * Premium Info Schema
 */

export const PremiumInfoSchema = z.object({
    startTimestamp: z.number().int().nonnegative(),
    expirationTimestamp: z
        .number()
        .int()
        .nonnegative()
        .or(z.literal(-1).describe("lifetime premium")),
});
export type PremiumInfo = z.infer<typeof PremiumInfoSchema>;

/**
 * User Schema (for validation)
 */

export const UserSchema = z.object({
    uid: z.string(),
    email: z.string().email(),
    name: z
        .string()
        .min(1)
        .max(16)
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Can only contain letters, numbers, underscore and minus"
        ),
    addedAt: z.number().int().nonnegative(),

    // Core statistics
    personalBests: PersonalBestsSchema,
    completedTests: z.number().int().nonnegative().optional(),
    startedTests: z.number().int().nonnegative().optional(),
    timeTyping: z.number().nonnegative().optional(),
    xp: z.number().int().nonnegative().optional(),

    // Streak
    streak: UserStreakSchema.optional(),

    // Profile
    profileDetails: UserProfileDetailsSchema.optional(),

    // Tags
    tags: z.array(UserTagSchema).optional(),

    // Custom themes
    customThemes: z.array(CustomThemeSchema).optional(),

    // Result filters
    resultFilterPresets: z.array(ResultFilterPresetSchema).optional(),

    // Test activity
    testActivity: CountByYearAndDaySchema.optional(),

    // Discord integration
    discordId: z.string().optional(),
    discordAvatar: z.string().optional(),

    // Leaderboard
    lbOptOut: z.boolean().optional(),

    // Premium
    premium: PremiumInfoSchema.optional(),

    // Admin/moderation
    banned: z.boolean().optional(),
    verified: z.boolean().optional(),
    needsToChangeName: z.boolean().optional(),

    // Internal tracking
    lastNameChange: z.number().optional(),
    nameHistory: z.array(z.string()).optional(),
    ips: z.array(z.string()).optional(),
    canReport: z.boolean().optional(),
    suspicious: z.boolean().optional(),
    note: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

/**
 * Database User Type (includes MongoDB _id)
 */

export interface DBUser extends Omit<User, "tags" | "customThemes" | "resultFilterPresets"> {
    _id: ObjectId;
    tags?: Array<Omit<UserTag, "_id"> & { _id: ObjectId }>;
    customThemes?: Array<Omit<CustomTheme, "_id"> & { _id: ObjectId }>;
    resultFilterPresets?: Array<Omit<ResultFilterPreset, "_id"> & { _id: ObjectId }>;
}

/**
 * Helper function to create a new user document
 */

export function createNewUser(
    uid: string,
    email: string,
    name: string
): Omit<DBUser, "_id"> {
    return {
        uid,
        email,
        name,
        addedAt: Date.now(),
        personalBests: {
            time: {},
            words: {},
            zen: {},
        },
        testActivity: {},
    };
}
