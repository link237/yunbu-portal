import { PrismaClient, TeamRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 创建两个示例应用
  const [app1, app2] = await Promise.all([
    prisma.app.upsert({
      where: { id: "seed-app-1" },
      update: {},
      create: {
        id: "seed-app-1",
        name: "Agent Chat",
        description: "内置示例智能体页面",
        url: "/apps/agent-chat",
        isExternal: false
      }
    }),
    prisma.app.upsert({
      where: { id: "seed-app-2" },
      update: {},
      create: {
        id: "seed-app-2",
        name: "Documentation",
        description: "示例外部链接到文档",
        url: "https://example.com/docs",
        isExternal: true
      }
    })
  ]);

  // 创建示例团队和用户
  const adminPwd = await bcrypt.hash("password123", 10);
  const memberPwd = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { phone: "11111111111" },
    update: {},
    create: {
      phone: "11111111111",
      name: "Alice",
      passwordHash: adminPwd
    }
  });

  const member = await prisma.user.upsert({
    where: { phone: "22222222222" },
    update: {},
    create: {
      phone: "22222222222",
      name: "Bob",
      passwordHash: memberPwd
    }
  });

  const team = await prisma.team.create({ data: { name: "Demo Team" } });

  await prisma.teamMember.create({
    data: { userId: admin.id, teamId: team.id, role: TeamRole.ADMIN }
  });
  await prisma.teamMember.create({
    data: { userId: member.id, teamId: team.id, role: TeamRole.USER }
  });

  // 团队默认权限：app1 可见可用，app2 默认不可见
  await prisma.teamApp.create({
    data: { teamId: team.id, appId: app1.id, defaultCanView: true, defaultCanUse: true }
  });
  await prisma.teamApp.create({
    data: { teamId: team.id, appId: app2.id, defaultCanView: false, defaultCanUse: false }
  });

  console.log("Seed done. Admin phone=11111111111 / pwd=password123");
}

main().finally(async () => {
  await prisma.$disconnect();
});
