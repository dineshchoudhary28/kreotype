export function generateTemplate(name: string): string {
  return `import type { Migration } from "../types.js";

const migration: Migration = {
  name: "${name}",
  description: "TODO: Describe what this migration does",

  async up({ db, log, dryRun, batchSize }) {
    // TODO: Implement forward migration
    //
    // Example: Add a field to all documents in a collection
    //
    // const collection = db.collection("users");
    // const count = await collection.countDocuments({ newField: { $exists: false } });
    // log(\`Found \${count} documents to migrate\`);
    //
    // if (dryRun) return;
    //
    // await collection.updateMany(
    //   { newField: { $exists: false } },
    //   { $set: { newField: "defaultValue" } }
    // );
    //
    // log(\`Updated \${count} documents\`);
  },

  async down({ db, log, dryRun }) {
    // TODO: Implement rollback
    //
    // Example: Remove the field added in up()
    //
    // if (dryRun) return;
    //
    // await db.collection("users").updateMany({}, { $unset: { newField: "" } });
    // log("Removed newField from all user documents");
  },
};

export default migration;
`;
}
