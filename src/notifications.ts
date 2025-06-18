import { MyContext } from './interfaces';
import { InlineKeyboard } from 'grammy';

export async function handleNotifications(ctx: MyContext) {
  if (!ctx.session.isLoggedIn) {
    await ctx.reply('🔒 Por favor, inicia sesión primero.');
    return;
  }

  const notifications = ctx.session.notifications;
  const pending = notifications.filter(n => !n.completed);
  const completed = notifications.filter(n => n.completed);

  let message = `🔔 *Tus notificaciones*\n\n`;

  if (pending.length > 0) {
    message += `*Pendientes:*\n`;
    pending.forEach(notif => {
      message += `- ${notif.title} (Vence: ${notif.dueDate})\n` +
                 `  ${notif.description}\n` +
                 `  [Marcar como completada](/done_${notif.id})\n\n`;
    });
  } else {
    message += `🎉 No tienes notificaciones pendientes.\n\n`;
  }

  if (completed.length > 0) {
    message += `\n*Completadas:*\n`;
    completed.forEach(notif => {
      message += `- ✅ ${notif.title} (Completada)\n`;
    });
  }

  const keyboard = new InlineKeyboard()
    .text('🔄 Actualizar', 'refresh_notifications');

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: true
  });
}

export async function handleNotificationAction(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const data = ctx.callbackQuery.data;

  // Manejar actualización
  if (data === 'refresh_notifications') {
    await ctx.answerCallbackQuery({ text: 'Notificaciones actualizadas' });
    await handleNotifications(ctx);
    return;
  }

  // Manejar marcado como completado
  if (data.startsWith('done_')) {
    const id = parseInt(data.split('_')[1]);
    const notification = ctx.session.notifications.find(n => n.id === id);

    if (notification) {
      notification.completed = true;
      await ctx.answerCallbackQuery({ text: '✅ Tarea marcada como completada' });
      await handleNotifications(ctx);
    }
  }
}
