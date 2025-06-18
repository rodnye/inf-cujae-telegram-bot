import { handleAuth } from "../auth";
import { MyContext } from "../interfaces";
import { ActionKeyboard } from "../utils/keyboard";

export const authBoard = new ActionKeyboard<MyContext>()
  .action("🔑 Iniciar sesión", handleAuth)
  .resized();
