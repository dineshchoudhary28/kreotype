import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/server/models/User";
import { requireAuth } from "@/server/middleware/auth";
import { z } from "zod";

const updateInventorySchema = z.object({
  badges: z.array(z.string()).max(5, "You can equip a maximum of 5 badges."),
});

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const body = await request.json();
  const parsed = updateInventorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const { badges: badgesToEquip } = parsed.data;

  // Validate that the user has earned the badges they are trying to equip
  const earnedBadgeIds = new Set(user.badges.map(b => b.badgeId));
  const allBadgesValid = badgesToEquip.every(badgeId => earnedBadgeIds.has(badgeId));

  if (!allBadgesValid) {
    return NextResponse.json({ error: "You are trying to equip badges you have not earned." }, { status: 403 });
  }

  await connectDB();
  await User.findByIdAndUpdate(user._id, { $set: { "inventory.badges": badgesToEquip } });

  return NextResponse.json({ message: "Inventory updated" });
}
