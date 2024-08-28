import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Scene, SceneEnter, Ctx, On, Message } from 'nestjs-telegraf';
import { CreateLinkDto } from 'src/links/dto/create-link.dto';
import { LinksService } from 'src/links/links.service';
import { SceneContext } from 'telegraf/typings/scenes';

@Scene('SAVE_LINK_SCENE')
export class SaveLinkScene {
  constructor(private readonly linksService: LinksService) {}

  @SceneEnter()
  async onEnter(@Ctx() context: SceneContext) {
    await context.reply('Введите ссылку, которую хотите сохранить:');
  }

  @On('text')
  async onText(@Ctx() context: SceneContext, @Message('text') url: string) {
    const linkDto = plainToInstance(CreateLinkDto, { url });

    const errors = await validate(linkDto);

    if (errors.length > 0) {
      await context.reply(
        'Неверный формат ссылки. Пожалуйста, введите корректный URL.',
      );
      context.scene.leave();
      context.scene.enter('SAVE_LINK_SCENE');
    } else {
      try {
        await this.linksService.saveLink(linkDto);
        await context.reply('Ссылка успешно сохранена!');
      } catch (error) {
        await context.reply('Произошла ошибка при сохранении ссылки.', error);
      }
    }

    await context.scene.leave();
  }
}
