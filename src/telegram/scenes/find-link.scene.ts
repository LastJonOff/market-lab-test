import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Scene, SceneEnter, Ctx, On, Message } from 'nestjs-telegraf';
import { FindLinkDto } from 'src/links/dto/find-link.dto';
import { LinksService } from 'src/links/links.service';
import { SceneContext } from 'telegraf/typings/scenes';
import { TelegramService } from '../telegram.service';
import { NotFoundException } from '@nestjs/common';

@Scene('FIND_LINK_SCENE')
export class FindLinkScene {
  constructor(
    private readonly linksService: LinksService,
    private readonly telegramService: TelegramService,
  ) {}

  @SceneEnter()
  async onEnter(@Ctx() context: SceneContext) {
    await context.reply('Введите код, чтобы получить ссылку:');
  }

  @On('text')
  async onText(@Ctx() context: SceneContext, @Message('text') code: string) {
    const linkDto = plainToInstance(FindLinkDto, { code });

    const errors = await validate(linkDto);

    if (errors.length > 0) {
      await context.reply('Неверный код. Пожалуйста, введите корректный код.');
      context.scene.leave();
      context.scene.enter('FIND_LINK_SCENE');
    } else {
      try {
        const link = await this.linksService.findLink(linkDto);
        await context.reply(`Ссылка: ${link.url}`);
      } catch (error) {
        if (error instanceof NotFoundException) {
          await context.reply(
            'Ссылка не найдена. Пожалуйста, попробуйте снова.',
          );
          context.scene.leave();
          context.scene.enter('DELETE_LINK_SCENE');
        } else {
          await context.reply('Произошла ошибка при поиске ссылки.', error);
          await context.scene.leave();
          await this.telegramService.showMenu(context);
        }
      }
    }

    await context.scene.leave();
  }
}
