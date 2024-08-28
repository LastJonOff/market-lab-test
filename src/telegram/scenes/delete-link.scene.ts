import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Scene, SceneEnter, Ctx, On, Message } from 'nestjs-telegraf';
import { DeleteLinkDto } from 'src/links/dto/delete-link.dto';
import { LinksService } from 'src/links/links.service';
import { SceneContext } from 'telegraf/typings/scenes';
import { TelegramService } from '../telegram.service';

@Scene('DELETE_LINK_SCENE')
export class DeleteLinkScene {
  constructor(
    private readonly linksService: LinksService,
    private readonly telegramService: TelegramService,
  ) {}

  @SceneEnter()
  async onEnter(@Ctx() context: SceneContext) {
    await context.reply('Введите код ссылки, которую хотите удалить:');
  }

  @On('text')
  async onText(@Ctx() context: SceneContext, @Message('text') code: string) {
    const linkDto = plainToInstance(DeleteLinkDto, { code });

    const errors = await validate(linkDto);

    if (errors.length > 0) {
      await context.reply('Неверный код. Пожалуйста, введите корректный.');
      context.scene.leave();
      context.scene.enter('DELETE_LINK_SCENE');
    } else {
      try {
        await this.linksService.deleteLink(linkDto);
        await context.reply('Ссылка успешно удалена!');
      } catch (error) {
        if (error)
          if (error instanceof NotFoundException) {
            await context.reply(
              'Ссылка не найдена. Пожалуйста, попробуйте снова.',
            );
            context.scene.leave();
            context.scene.enter('DELETE_LINK_SCENE');
          } else {
            await context.reply('Произошла ошибка при удалении ссылки.', error);
            await context.scene.leave();
            await this.telegramService.showMenu(context);
          }
      }
    }

    await context.scene.leave();
  }
}
