import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { LinksModule } from 'src/links/links.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SaveLinkScene } from './scenes/save-link.scene';
import * as LocalSession from 'telegraf-session-local';
import { FindLinkScene } from './scenes/find-link.scene';
import { DeleteLinkScene } from './scenes/delete-link.scene';

const session = new LocalSession();

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_API'),
        middlewares: [session.middleware()], // Define middlewares if necessary
      }),
    }),
    LinksModule,
  ],
  providers: [TelegramService, SaveLinkScene, FindLinkScene, DeleteLinkScene],
})
export class TelegramModule {}
