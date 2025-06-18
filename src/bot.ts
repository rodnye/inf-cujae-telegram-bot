import { Bot, session, Keyboard, InlineKeyboard } from "grammy";
import { hydrateFiles } from "@grammyjs/files";
import { autoRetry } from "@grammyjs/auto-retry";
import dotenv from "dotenv";

import { MyContext, SessionData } from "./interfaces";
import { handleAuth } from "./auth";
import { initialData } from "./data";
import { mainBoard } from "./boards/main";
import { authBoard } from "./boards/auth";
import { handleNotificationAction } from "./notifications";

dotenv.config();

// Configuración inicial del bot
export const bot = new Bot<MyContext>(process.env.BOT_TOKEN || "");

// Habilitar manejo de archivos
bot.api.config.use(hydrateFiles(bot.token));
bot.api.config.use(autoRetry());

// Configurar sesión
bot.use(
  session({
    initial: (): SessionData => ({
      isLoggedIn: false,
      userId: "",
      notifications: initialData.notifications,
    }),
  })
);


// Manejar el comando /start
bot.command("start", async (ctx) => {
  if (!ctx.session.isLoggedIn) {
    await ctx.reply(
      `*Bienvenido al Bot Informativo de la Facultad de Ingeniería Informática* 🏫\n\n` +
        `Por favor, *inicia sesión* para acceder a los servicios.\n`,
      {
        parse_mode: "Markdown",
        reply_markup: authBoard,
      }
    );
  } else {
    await ctx.reply(`¡Hola de nuevo! 👋\n` + `¿Qué deseas hacer hoy?`, {
      parse_mode: "Markdown",
      reply_markup: mainBoard,
    });
  }
});

// NO permitir hacer nada si no está logueado
bot.use(authBoard.middleware());
bot.on("message", async (ctx, next) => {
  if (!ctx.session.isLoggedIn) {
    if (!ctx.session.waitingFor) {
      await ctx.reply("🔒 Por favor, inicia sesión primero.", {
        reply_markup: authBoard,
      });
      return;
    }
    await handleAuth(ctx);
    return;
  }

  return next();
});

bot.use(mainBoard.middleware());
bot.callbackQuery(/.*/, handleNotificationAction);

bot.on("message", async (ctx, next) => {
  await ctx.reply(`Selecciona una opción del menú:`, {
    reply_markup: mainBoard,
  });
});

// Iniciar el bot
const main = async () => {
  bot.start();
  console.log("Bot iniciado correctamente 🚀");
};

main();
