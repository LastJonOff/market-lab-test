import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';

type Context = Scenes.SceneContext;

@Update()
export class TelegramService extends Telegraf<Context> {
  @Start()
  onStart(@Ctx() context: Context) {
    context.reply('Выберите нужную опцию: ', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Сохранить ссылку', callback_data: 'save_url' },
            { text: 'Найти ссылку', callback_data: 'get_url' },
          ],
          [
            { text: 'Посмотреть список ссылок', callback_data: 'get_urls' },
            { text: 'Удалить ссылку', callback_data: 'delete_url' },
          ],
        ],
      },
    });
  }
}
