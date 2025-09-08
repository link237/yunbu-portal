import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const teamId = req.headers.get("x-team-id")!;
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: true }
  });
  return NextResponse.json(
    members.map((m: { user: { id: string; name: string }; role: string }) => ({ id: m.user.id, name: m.user.name, role: m.role }))
  );
}
