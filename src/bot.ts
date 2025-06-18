import { Bot, session, Keyboard, InlineKeyboard } from 'grammy';
import { Menu } from '@grammyjs/menu';
import { hydrateFiles } from '@grammyjs/files';
import { autoRetry } from '@grammyjs/auto-retry';
import dotenv from 'dotenv';
import path from 'path';

import { MyContext, SessionData } from './interfaces';
import { handleAuth } from './auth';
import { handleSchedule } from './schedule';
import { handleNotifications } from './notifications';
import { handleGrades } from './grades';
import { initialData } from './data';

dotenv.config();

// Configuración inicial del bot
export const bot = new Bot<MyContext>(process.env.BOT_TOKEN || '');

// Habilitar manejo de archivos
bot.api.config.use(hydrateFiles(bot.token));
bot.api.config.use(autoRetry());

// Configurar sesión
bot.use(session({
  initial: (): SessionData => ({
    isLoggedIn: false,
    userId: '',
    waitingFor: null,
    notifications: initialData.notifications,
  }),
}));

// Menú principal
const mainMenu = new Menu<MyContext>('main-menu')
  .text('📅 Horario', async (ctx) => {
    await handleSchedule(ctx);
  }).row()
  .text('🔔 Notificaciones', async (ctx) => {
    await handleNotifications(ctx);
  }).row()
  .text('📊 Notas', async (ctx) => {
    await handleGrades(ctx);
  }).row()
  .text('ℹ️ Ayuda', async (ctx) => {
    await ctx.reply(
      `*Bienvenido al Bot Informativo de la CUJAE* 🎓\n\n` +
      `Este bot te ayuda a mantenerte informado sobre:\n` +
      `- 📅 Tu horario de clases\n` +
      `- 🔔 Notificaciones importantes\n` +
      `- 📊 Tus calificaciones\n\n` +
      `*¿Cómo usarlo?*\n` +
      `Simplemente selecciona una opción del menú.`,
      { parse_mode: 'Markdown' }
    );
  });

bot.use(mainMenu);

// Manejar el comando /start
bot.command('start', async (ctx) => {
  if (!ctx.session.isLoggedIn) {
    await ctx.reply(
      `*Bienvenido al Bot Informativo de la CUJAE* 🏫\n\n` +
      `Por favor, *inicia sesión* para acceder a los servicios.\n` +
      `Tu carnet es tu ID de 11 dígitos.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: new Keyboard()
          .text('🔑 Iniciar sesión')
          .resized()
      }
    );
  } else {
    await ctx.reply(
      `¡Hola de nuevo! 👋\n` +
      `¿Qué deseas hacer hoy?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: mainMenu
      }
    );
  }
});

// Manejar autenticación
bot.hears('🔑 Iniciar sesión', async (ctx) => {
  await handleAuth(ctx);
});

// Manejar mensajes no reconocidos
bot.on('message', async (ctx) => {
  if (!ctx.session.isLoggedIn) {
    await ctx.reply(
      `🔒 Por favor, *inicia sesión* primero para usar el bot.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: new Keyboard()
          .text('🔑 Iniciar sesión')
          .resized()
      }
    );
  } else {
    await ctx.reply(
      `Selecciona una opción del menú:`,
      { reply_markup: mainMenu }
    );
  }
});

// Iniciar el bot
bot.start();
console.log('Bot iniciado correctamente 🚀');
