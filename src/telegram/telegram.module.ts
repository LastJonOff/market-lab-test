import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { options } from './telegram-config.factory';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  imports: [TelegrafModule.forRootAsync(options())],
  providers: [TelegramService],
})
export class TelegramModule {}
