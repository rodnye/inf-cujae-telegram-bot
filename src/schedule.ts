import { MyContext } from './interfaces';
import { Bot } from 'grammy';
import path from 'path';

export async function handleSchedule(ctx: MyContext) {
  if (!ctx.session.isLoggedIn) {
    await ctx.reply('🔒 Por favor, inicia sesión primero.');
    return;
  }

  try {
    // Enviar el archivo de horario (en producción, esto vendría de una BD)
    const file = await Bot.inputFile(path.join(__dirname, '../assets/horario.xlsx'));
    await ctx.replyWithDocument(file, {
      caption: `📅 *Horario de clases* - Estudiante ${ctx.session.userId}\n\n` +
               `Aquí tienes tu horario actualizado.`,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error al enviar el horario:', error);
    await ctx.reply(
      `❌ No se pudo cargar el horario en este momento. Por favor, inténtalo más tarde.`
    );
  }
}
