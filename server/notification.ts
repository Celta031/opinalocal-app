// Novo arquivo: server/notification.ts

import webpush from 'web-push';
import { Resend } from 'resend';
import { storage } from './storage';
import { User } from '@shared/schema';

if (!process.env.VITE_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn("VAPID keys não estão configuradas. Notificações Push não funcionarão.");
} else {
  webpush.setVapidDetails(
    'mailto:seu-email-de-contato@exemplo.com',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

async function sendNotification(userId: number, payload: NotificationPayload) {
  const user = await storage.getUser(userId);
  if (!user) return;

  // 1. Enviar E-mail (Exemplo para "Comentário na sua avaliação")
  // Aqui você adicionaria a lógica para verificar as preferências do usuário
  // if (user.notifyOnComment) {
  //   await resend.emails.send({
  //     from: 'OpinaLocal <nao-responda@sua-plataforma.com>',
  //     to: user.email,
  //     subject: payload.title,
  //     html: `<p>${payload.body}</p><p><a href="${payload.url || '#'}">Ver agora</a></p>`,
  //   });
  // }

  // 2. Enviar Web Push Notification
  const subscriptions = await storage.getPushSubscriptions(userId);
  if (subscriptions.length > 0) {
    const pushPayload = JSON.stringify(payload);
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub.subscription as any, pushPayload)
        .catch((error: any) => console.error("Erro ao enviar push notification:", error));
    });
  }
}

export { sendNotification };