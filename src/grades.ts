import { InlineKeyboard } from 'grammy';
import { MyContext } from './interfaces';

export async function handleGrades(ctx: MyContext) {
  const gradesTable = `
📊 *Calificaciones del Estudiante ${ctx.session.userId}*

\`\`\`
+------------------------------+-------+-------+
| Asignatura                   | Parcial | Final |
+------------------------------+-------+-------+
| Matemática Discreta          |   92  |   95  |
| Programación I               |   88  |   90  |
| Bases de Datos               |   85  |   87  |
| Arquitectura de Computadoras |   90  |   93  |
| Inglés Técnico              |   95  |   96  |
+------------------------------+-------+-------+
| Promedio                     |   90  |   92.2|
+------------------------------+-------+-------+
\`\`\`
  `;

  await ctx.reply(gradesTable, {
    parse_mode: 'Markdown',
    reply_markup: new InlineKeyboard()
      .text('📤 Exportar a PDF', 'export_grades')
  });
}
