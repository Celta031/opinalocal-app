import webpush from 'web-push';
import { Resend } from 'resend';
import { storage } from './storage';
import type { User } from '@shared/schema';
import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';

// Configuração do Web Push (mantida como está)
if (process.env.VITE_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:seu-email@seudominio.com',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys não configuradas. Notificações Push estão desativadas.");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const emailTemplatePath = path.join(process.cwd(), 'server', 'templates', 'email-base.html');
let compiledTemplate: Handlebars.TemplateDelegate;

// Função para carregar o template
(async () => {
  try {
    const templateContent = await fs.readFile(emailTemplatePath, 'utf-8');
    compiledTemplate = Handlebars.compile(templateContent);
    console.log("Template de e-mail carregado com sucesso.");
  } catch (error) {
    console.error('Erro ao carregar o template de e-mail:', error);
    compiledTemplate = () => '<h1>Erro ao carregar template</h1><p>{{{body}}}</p>';
  }
})();

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

async function sendNotification(user: User, payload: NotificationPayload, type: keyof Pick<User, 'notifyOnComment' | 'notifyOnNewReview' | 'notifyOnCategoryApproval' | 'notifyOnNewsletter'>) {
  if (!(user as any)[type]) {
    console.log(`Notificação do tipo "${type}" desativada para o usuário ${user.id}.`);
    return;
  }

  // Enviar E-mail via Resend
  if (compiledTemplate && process.env.RESEND_API_KEY) {
    try {
      // Definimos a URL pública da logo aqui
      const logoUrl = 'https://i.postimg.cc/nrH796Tg/Logo-Opina-Local-1.png'; 
      // Em produção, você mudaria para: 'https://www.opinalocal.com/Logo_OpinaLocal.png'

      const emailHtml = compiledTemplate({
        subject: payload.title,
        userName: user.name,
        body: payload.body,
        url: payload.url,
        logoUrl: logoUrl, // Passamos a URL para o template
      });
      
      await resend.emails.send({
        from: 'OpinaLocal <onboarding@resend.dev>',
        to: user.email,
        subject: payload.title,
        html: emailHtml,
        // Não precisamos mais da seção 'attachments'
      });
      console.log(`E-mail do tipo "${type}" enviado para ${user.email}`);
    } catch (error) {
      console.error("Erro ao enviar e-mail via Resend:", error);
    }
  }

  // A lógica de Web Push continua a mesma
  try {
    const subscriptions = await storage.getPushSubscriptions(user.id);
    if (subscriptions.length > 0) {
      const pushPayload = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url });
      for (const sub of subscriptions) {
        await webpush.sendNotification(sub.subscription as any, pushPayload)
          .catch((err: any) => console.error(`Erro ao enviar push para subscription ${sub.id}:`, err));
      }
      console.log(`Notificação Push do tipo "${type}" enviada para o usuário ${user.id}`);
    }
  } catch (error) {
    console.error("Erro ao buscar ou enviar notificações push:", error);
  }
}

export { sendNotification };