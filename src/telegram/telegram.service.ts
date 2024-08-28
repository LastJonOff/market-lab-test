import { ConfigService } from '@nestjs/config';
import { Action, Ctx, Start, Update } from 'nestjs-telegraf';
import { LinksService } from 'src/links/links.service';
import { Scenes, Telegraf } from 'telegraf';
import { SceneSession, SceneSessionData } from 'telegraf/typings/scenes';

interface SessionData extends SceneSessionData {
  page?: number;
}
interface CustomContext extends Scenes.SceneContext {
  session: SceneSession<SessionData>;
}
type Context = CustomContext;
@Update()
export class TelegramService extends Telegraf<Context> {
  constructor(
    private readonly configService: ConfigService,
    private readonly linksService: LinksService,
  ) {
    super(configService.get('TELEGRAM_API'));
  }

  async showMenu(@Ctx() context: Context) {
    context.reply('Выберите нужную опцию: ', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Сохранить ссылку', callback_data: 'save_link' },
            { text: 'Найти ссылку', callback_data: 'get_link' },
          ],
          [
            { text: 'Посмотреть список ссылок', callback_data: 'get_links' },
            { text: 'Удалить ссылку', callback_data: 'delete_link' },
          ],
        ],
      },
    });
  }

  @Start()
  onStart(@Ctx() context: Context) {
    this.showMenu(context);
  }

  @Action('save_link')
  async onSaveLink(@Ctx() context: Context) {
    await context.scene.enter('SAVE_LINK_SCENE');
  }

  @Action('get_link')
  async onGetLink(@Ctx() context: Context) {
    await context.scene.enter('FIND_LINK_SCENE');
  }

  @Action('get_links')
  async onGetLinks(@Ctx() context: Context) {
    const pageSize = 2; // Number of links per page
    const page = context.session.__scenes.page || 1;
    try {
      const links = await this.linksService.findAllLinks();

      if (links.length === 0) {
        await context.reply('Ссылки не найдены.');
        return;
      }

      const totalPages = Math.ceil(links.length / pageSize);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const linksToDisplay = links.slice(startIndex, endIndex);

      const formattedLinks = linksToDisplay
        .map(
          (link, index) =>
            `${startIndex + index + 1}. Ссылка: ${link.url}. Код: ${link.code}`,
        )
        .join('\n');

      const replyMarkup = {
        inline_keyboard: [
          [
            ...(page > 1
              ? [{ text: '⬅️ Предыдущая', callback_data: 'prev_page' }]
              : []),
            { text: 'меню', callback_data: 'menu' },
            ...(page < totalPages
              ? [{ text: 'Следующая ➡️', callback_data: 'next_page' }]
              : []),
          ],
        ],
      };

      await context.reply(
        `Список ссылок (страница ${page}/${totalPages}):\n${formattedLinks}`,
        { reply_markup: replyMarkup },
      );

      context.session.__scenes.page = page;
    } catch (error) {
      await context.reply('Произошла ошибка при сохранении ссылки.', error);
    }
    // context.reply('Введите ссылку, которую хотите сохранить:');
  }

  @Action('delete_link')
  async onDeleteLink(@Ctx() context: Context) {
    await context.scene.enter('DELETE_LINK_SCENE');
  }

  @Action('next_page')
  async onNextPage(@Ctx() context: Context) {
    context.session.__scenes.page = (context.session.__scenes.page || 1) + 1;
    await this.onGetLinks(context);
  }

  @Action('prev_page')
  async onPrevPage(@Ctx() context: Context) {
    context.session.__scenes.page = (context.session.__scenes.page || 1) - 1;
    await this.onGetLinks(context);
  }

  @Action('menu')
  async onMenuShow(@Ctx() context: Context) {
    context.session.__scenes.page = 1;
    context.scene.leave();
    await this.showMenu(context);
  }
}
