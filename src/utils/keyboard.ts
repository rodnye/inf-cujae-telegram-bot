import { Context, Keyboard, MiddlewareFn } from "grammy";

type KeyboardHandler<TContext> = (ctx: TContext) => Promise<void>;

export class ActionKeyboard<
  TContext extends Context = Context
> extends Keyboard {
  private handlers: Record<string, KeyboardHandler<TContext>> = {};

  public action(message: string, handler: KeyboardHandler<TContext>) {
    super.text(message);
    this.handlers[message] = handler;
    return this;
  }

  async handle(ctx: TContext): Promise<boolean> {
    const text = ctx.message?.text;
    if (!text || !this.handlers[text]) return false;

    const handler = this.handlers[text];
    await handler(ctx);
    return true;
  }

  middleware(): MiddlewareFn<TContext> {
    return async (ctx: TContext, next: () => Promise<void>) => {
      if (await this.handle(ctx)) return;
      await next();
    };
  }
}
