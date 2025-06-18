import { MyContext } from './interfaces';
import { initialData } from './data';
import { Keyboard } from 'grammy';

export async function handleAuth(ctx: MyContext) {
  // Si ya está logueado
  if (ctx.session.isLoggedIn) {
    await ctx.reply(`✅ Ya has iniciado sesión como estudiante ${ctx.session.userId}.`);
    return;
  }

  // Solicitar carnet
  await ctx.reply(
    `📝 Por favor, introduce tu *carnet de identidad* (11 dígitos):`,
    { parse_mode: 'Markdown' }
  );

  // Esperar respuesta del carnet
  ctx.session.waitingFor = 'carnet';
}

// Manejar respuestas de autenticación
export async function handleAuthResponse(ctx: MyContext) {
  if (!ctx.message?.text) return;

  // Si está esperando el carnet
  if (ctx.session.waitingFor === 'carnet') {
    const carnet = ctx.message.text.trim();
    
    // Validar carnet
    if (!/^\d{11}$/.test(carnet)) {
      await ctx.reply(
        `❌ Carnet inválido. Debe contener *exactamente 11 dígitos*.\n` +
        `Por favor, inténtalo de nuevo:`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    ctx.session.tempCarnet = carnet;
    ctx.session.waitingFor = 'password';
    
    await ctx.reply(
      `🔒 Ahora introduce tu *contraseña*:`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Si está esperando la contraseña
  if (ctx.session.waitingFor === 'password') {
    const password = ctx.message.text.trim();
    const carnet = ctx.session.tempCarnet;

    // Validar credenciales (en un sistema real, esto sería contra una BD)
    if (password === 'cujae2023' && carnet) {
      ctx.session.isLoggedIn = true;
      ctx.session.userId = carnet;
      ctx.session.notifications = initialData.notifications;
      delete ctx.session.waitingFor;
      delete ctx.session.tempCarnet;

      await ctx.reply(
        `✅ *¡Autenticación exitosa!* Bienvenido estudiante ${carnet}.\n\n` +
        `Ahora puedes acceder a todas las funcionalidades del bot.`,
        { 
          parse_mode: 'Markdown',
          reply_markup: new Keyboard().remove()
        }
      );

      await ctx.reply(
        `¿Qué deseas hacer?`,
        { reply_markup: ctx.menu }
      );
    } else {
      await ctx.reply(
        `❌ *Contraseña incorrecta*. Por favor, inténtalo de nuevo.\n` +
        `Introduce tu carnet nuevamente:`,
        { 
          parse_mode: 'Markdown' 
        }
      );
      ctx.session.waitingFor = 'carnet';
    }
  }
}
