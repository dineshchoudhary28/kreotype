import { ObjectId, Filter } from "mongodb";
import { getUsersCollection, getResultsCollection } from "../../db";
import { DBUser, createNewUser } from "../schemas/user";
import { DBResult, CompletedEvent, buildDbResult, replaceLegacyValues } from "../schemas/result";
import { PersonalBest } from "../schemas/shared";

/**
 * User Operations
 */

/**
 * Add a new user to the database
 */
export async function addUser(
    uid: string,
    email: string,
    name: string
): Promise<void> {
    const users = await getUsersCollection();

    const newUser = createNewUser(uid, email, name);

    const result = await users.updateOne(
        { uid },
        { $setOnInsert: { ...newUser, _id: new ObjectId() } },
        { upsert: true }
    );

    if (result.upsertedCount === 0) {
        throw new Error("User already exists");
    }
}

/**
 * Get a user by UID
 */
export async function getUser(uid: string): Promise<DBUser | null> {
    const users = await getUsersCollection();
    return users.findOne({ uid });
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<DBUser | null> {
    const users = await getUsersCollection();
    return users.findOne({ email });
}

/**
 * Get a user by username
 */
export async function getUserByName(name: string): Promise<DBUser | null> {
    const users = await getUsersCollection();
    return users.findOne({ name });
}

/**
 * Check if a username is available
 */
export async function isNameAvailable(name: string, excludeUid?: string): Promise<boolean> {
    const users = await getUsersCollection();
    const query: Filter<DBUser> = { name: { $regex: new RegExp(`^${name}$`, "i") } };

    if (excludeUid) {
        query.uid = { $ne: excludeUid };
    }

    const existingUser = await users.findOne(query);
    return !existingUser;
}

/**
 * Update user's username
 */
export async function updateUserName(
    uid: string,
    newName: string,
    previousName: string
): Promise<void> {
    if (newName === previousName) {
        throw new Error("New name is the same as the old name");
    }

    if (
        newName.toLowerCase() !== previousName.toLowerCase() &&
        !(await isNameAvailable(newName, uid))
    ) {
        throw new Error("Username already taken");
    }

    const users = await getUsersCollection();
    await users.updateOne(
        { uid },
        {
            $set: { name: newName, lastNameChange: Date.now() },
            $unset: { needsToChangeName: "" },
            $push: { nameHistory: previousName },
        }
    );
}

/**
 * Update user's personal bests
 */
export async function updatePersonalBests(
    uid: string,
    mode: string,
    mode2: string,
    personalBest: PersonalBest
): Promise<void> {
    const users = await getUsersCollection();
    const path = `personalBests.${mode}.${mode2}`;

    await users.updateOne(
        { uid },
        { $push: { [path]: personalBest } }
    );
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string): Promise<void> {
    const users = await getUsersCollection();
    await users.deleteOne({ uid });
}

/**
 * Result Operations
 */

/**
 * Add a test result to the database
 */
export async function addResult(
    completedEvent: CompletedEvent,
    userName: string,
    isPb: boolean
): Promise<ObjectId> {
    const results = await getResultsCollection();

    const result = buildDbResult(completedEvent, userName, isPb);
    const dbResult: DBResult = {
        ...result,
        _id: new ObjectId(),
    };

    const insertResult = await results.insertOne(dbResult);
    return insertResult.insertedId;
}

/**
 * Get a result by ID
 */
export async function getResult(uid: string, resultId: string): Promise<DBResult | null> {
    const results = await getResultsCollection();
    const result = await results.findOne({
        _id: new ObjectId(resultId),
        uid,
    } as Filter<DBResult>);

    return result ? replaceLegacyValues(result) : null;
}

/**
 * Get user's last result
 */
export async function getLastResult(uid: string): Promise<DBResult | null> {
    const results = await getResultsCollection();
    const result = await results.findOne(
        { uid } as Filter<DBResult>,
        { sort: { timestamp: -1 } }
    );

    return result ? replaceLegacyValues(result) : null;
}

/**
 * Get user's results with pagination and filtering
 */
export async function getResults(
    uid: string,
    options?: {
        onOrAfterTimestamp?: number;
        limit?: number;
        offset?: number;
    }
): Promise<DBResult[]> {
    const results = await getResultsCollection();
    const { onOrAfterTimestamp, offset, limit } = options || {};

    const query: Filter<DBResult> = { uid };
    if (onOrAfterTimestamp !== undefined && !isNaN(onOrAfterTimestamp)) {
        query.timestamp = { $gte: onOrAfterTimestamp };
    }

    let cursor = results
        .find(query, {
            projection: {
                chartData: 0,
                keySpacingStats: 0,
                keyDurationStats: 0,
            },
        })
        .sort({ timestamp: -1 });

    if (limit !== undefined) {
        cursor = cursor.limit(limit);
    }
    if (offset !== undefined) {
        cursor = cursor.skip(offset);
    }

    const resultsList = await cursor.toArray();
    return resultsList.map(replaceLegacyValues);
}

/**
 * Delete all results for a user
 */
export async function deleteAllResults(uid: string): Promise<number> {
    const results = await getResultsCollection();
    const deleteResult = await results.deleteMany({ uid });
    return deleteResult.deletedCount;
}

/**
 * Update result tags
 */
export async function updateResultTags(
    uid: string,
    resultId: string,
    tags: string[]
): Promise<void> {
    const results = await getResultsCollection();

    await results.updateOne(
        { _id: new ObjectId(resultId), uid },
        { $set: { tags } }
    );
}
