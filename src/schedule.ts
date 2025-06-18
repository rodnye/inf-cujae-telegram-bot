import { MyContext } from "./interfaces";
import { Bot, InputFile } from "grammy";
import path from "path";

export async function handleSchedule(ctx: MyContext) {
  const file = new InputFile(path.join(__dirname, "../assets/horario.xlsx"));

  try {
    // Enviar el archivo de horario (en producción, esto vendría de una BD)
    await ctx.replyWithDocument(file, {
      caption:
        `📅 *Horario de clases* - Estudiante ${ctx.session.userData?.name}\n\n` +
        `Aquí tienes tu horario actualizado.`,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error al enviar el horario:", error);
    await ctx.reply(
      `❌ No se pudo cargar el horario en este momento. Por favor, inténtalo más tarde.`
    );
  }
}
