import { MyContext } from "../interfaces";
import { handleSchedule } from "../schedule";
import { handleNotifications } from "../notifications";
import { handleGrades } from "../grades";
import { ActionKeyboard } from "../utils/keyboard";

export const mainBoard = new ActionKeyboard<MyContext>()
  .action("📅 Horario", handleSchedule)
  .action("🔔 Notificaciones", handleNotifications)
  .row()
  .action("📊 Notas", handleGrades)
  .action("👤 Perfil", async (ctx) => {
    const user = ctx.session.userData;
    if (user) {
      await ctx.reply(
        `*Perfil de Usuario*\n\n` +
          `*Nombre:* ${user.name}\n` +
          `*Carnet:* ${user.cid}\n` +
          `*Año:* ${user.year}\n` +
          `${user.email ? `*Email:* ${user.email}\n` : ""}` +
          `${user.address ? `*Dirección:* ${user.address}\n` : ""}` +
          `${user.phone ? `*Teléfono:* ${user.phone}\n` : ""}` +
          `${user.courseType ? `*Tipo de Curso:* ${user.courseType}\n` : ""}` +
          `${user.userType ? `*Tipo de Usuario:* ${user.userType}\n` : ""}`,
        { parse_mode: "Markdown" }
      );
    } else {
      await ctx.reply("⚠️ No se encontró información del usuario.");
    }
  })
  .row()
  .action("¿Qué tengo pendiente?", async (ctx) => {
    await ctx.reply(
      "No tienes nada pendiente! ☕\n" +
      "¿Qué tal si tomas un café y estudias un poco? 📚"
    );
  })
  .action("ℹ️ Ayuda", async (ctx) => {
    await ctx.reply(
      `*Bienvenido al Bot Informativo de la CUJAE* 🎓\n\n` +
        `Este bot te ayuda a mantenerte informado sobre:\n` +
        `- 📅 Tu horario de clases\n` +
        `- 🔔 Notificaciones importantes\n` +
        `- 📊 Tus calificaciones\n\n` +
        `*¿Cómo usarlo?*\n` +
        `Simplemente selecciona una opción del menú.`,
      { parse_mode: "Markdown" }
    );
  })
  .resized();
