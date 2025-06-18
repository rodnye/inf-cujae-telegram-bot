import { MyContext } from "./interfaces";
import { initialData } from "./data";
import { mainBoard } from "./boards/main";
import axios from "axios";

export async function handleAuth(ctx: MyContext) {
  // Si ya está logueado
  if (ctx.session.isLoggedIn) {
    await ctx.reply(
      `✅ Ya has iniciado sesión como estudiante ${ctx.session.userId}.`
    );
    return;
  }

  // pasos
  if (!ctx.session.waitingFor) {
    // Solicitar carnet
    await ctx.reply(
      `📝 Por favor, introduce tu *carnet de identidad* (11 dígitos):`,
      { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
    );

    // Esperar respuesta del carnet
    ctx.session.waitingFor = "carnet";
    return;
  }

  if (!ctx.message?.text) return;

  // Si está esperando el carnet
  if (ctx.session.waitingFor === "carnet") {
    const carnet = ctx.message.text.trim();

    // Validar carnet
    if (!/^\d{11}$/.test(carnet)) {
      await ctx.reply(
        `❌ Carnet inválido. Debe contener *exactamente 11 dígitos*.\n` +
          `Por favor, inténtalo de nuevo:`,
        { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
      );
      return;
    }

    ctx.session.tempCarnet = carnet;
    ctx.session.waitingFor = "password";

    await ctx.reply(`🔒 Ahora introduce tu *contraseña*:`, {
      parse_mode: "Markdown",
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  // Si está esperando la contraseña
  if (ctx.session.waitingFor === "password") {
    const password = ctx.message.text.trim();
    const carnet = ctx.session.tempCarnet;

    try {
      const authResponse = await axios.post(`${process.env.SERVER_URL}/api/auth`, {
        cid: carnet,
        pass: password,
      });

      if (authResponse.status === 200 && authResponse.data.session) {
        // Solicitar perfil del usuario
        ctx.session.sessionToken = authResponse.data.session;
        const profileResponse = await axios.get(`${process.env.SERVER_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${ctx.session.sessionToken}`,
            "Admin-Token": process.env.ADMIN_PASS,
          },
        });

        if (profileResponse.status === 200 && profileResponse.data) {
          ctx.session.userData = profileResponse.data.user; 
          ctx.session.isLoggedIn = true;
        } else {
          console.log(profileResponse.data)
          throw new Error("Error al obtener el perfil del usuario");
        }

        ctx.session.notifications = initialData.notifications;
        delete ctx.session.waitingFor;
        delete ctx.session.tempCarnet;

        await ctx.reply(
          `✅ *¡Autenticación exitosa!* Bienvenido *${ctx.session.userData?.name}*.\n\n` +
            `Ahora puedes acceder a todas las funcionalidades del bot.`,
          {
            parse_mode: "Markdown",
          }
        );

        await ctx.reply(`¿Qué deseas hacer?`, { reply_markup: mainBoard });
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      console.log(error)
      await ctx.reply(
        `❌ *Credenciales incorrectas o error en el sistema*. Por favor, inténtalo de nuevo.\n` +
          `Introduce tu carnet nuevamente:`,
        {
          parse_mode: "Markdown",
          reply_markup: { remove_keyboard: true },
        }
      );
      ctx.session.waitingFor = "carnet";
    }
  }
}
