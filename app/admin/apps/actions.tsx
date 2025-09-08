'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createApp(formData: FormData) {
  // 从中间件注入的请求头拿 teamId
  const h = headers();
  const teamId = h.get('x-team-id');
  if (!teamId) {
    return { ok: false, message: '缺少团队上下文（未登录或会话失效）' };
  }

  const name = (formData.get('name') as string)?.trim();
  const url  = (formData.get('url') as string)?.trim();
  const isExternal = formData.get('isExternal') === 'on';

  if (!name || !url) {
    return { ok: false, message: '请填写应用名称与地址' };
  }

  // 1) 创建 App
  const app = await prisma.app.create({
    data: { name, url, isExternal },
  });

  // 2) 让当前团队“上架/可见”此 App（TeamApp）
  await prisma.teamApp.create({
    data: {
      teamId,
      appId: app.id,
      // 默认权限按需设置
      defaultCanView: true,
      defaultCanUse:  true,
    },
  });

  // 3) 让页面重新取数据
  revalidatePath('/admin/apps');

  return { ok: true };
}
