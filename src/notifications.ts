import { MyContext } from "./interfaces";
import { InlineKeyboard } from "grammy";

export async function handleNotifications(ctx: MyContext) {
  // Obtener y clasificar notificaciones
  const notifications = ctx.session.notifications || [];
  const pending = notifications.filter((n) => !n.completed);
  const completed = notifications.filter((n) => n.completed);

  // Construir mensaje
  let message = `🔔 *Tus notificaciones*\n\n`;

  if (pending.length > 0) {
    message += `*📝 Pendientes (${pending.length}):*\n`;
    pending.forEach((notif, index) => {
      message +=
        `\n${index + 1}. *${notif.title}*` +
        `\n   📅 Vence: ${notif.dueDate}` +
        `\n   📌 ${notif.description}\n`;
    });
  } else {
    message += `🎉 *No tienes notificaciones pendientes*\n\n`;
  }

  if (completed.length > 0) {
    message += `\n*✅ Completadas (${completed.length}):*\n`;
    completed.forEach((notif, index) => {
      message +=
        `\n${index + 1}. ${notif.title}` +
        `\n   🏁 Completada el: ${notif.completedDate || "fecha desconocida"}`;
    });
  }

  // Crear teclado inline
  const keyboard = new InlineKeyboard();

  // Añadir botones para cada notificación pendiente
  pending.forEach((notif) => {
    keyboard.text(`✅ ${notif.title}`, `complete_${notif.id}`).row();
  });

  // Botones de acción general
  keyboard
    .row()
    .text("🔄 Actualizar", "refresh_notifications")
    .text("🗑 Limpiar completadas", "clear_completed");

  // Enviar o editar mensaje
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      await ctx.answerCallbackQuery();
    } else {
      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error("Error al enviar notificaciones:", error);
  }
}

export async function handleNotificationAction(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const data = ctx.callbackQuery.data;

  try {
    // Actualizar lista
    if (data === "refresh_notifications") {
      await ctx.answerCallbackQuery({ text: "♻️ Notificaciones actualizadas" });
      await handleNotifications(ctx);
      return;
    }

    // Marcar como completada
    if (data.startsWith("complete_")) {
      const id = parseInt(data.split("_")[1]);
      const notification = ctx.session.notifications.find((n) => n.id === id);

      if (notification) {
        notification.completed = true;
        notification.completedDate = new Date().toLocaleDateString();
        await ctx.answerCallbackQuery({
          text: `✅ "${notification.title}" completada`,
          show_alert: true,
        });
        await handleNotifications(ctx);
      }
      return;
    }

    // Limpiar completadas
    if (data === "clear_completed") {
      ctx.session.notifications = ctx.session.notifications.filter(
        (n) => !n.completed
      );
      await ctx.answerCallbackQuery({
        text: "🧹 Notificaciones completadas eliminadas",
      });
      await handleNotifications(ctx);
      return;
    }

  } catch (error) {
    console.error("Error en handleNotificationAction:", error);
    await ctx.answerCallbackQuery({
      text: "❌ Error al procesar la acción",
      show_alert: true,
    });
  }
}
