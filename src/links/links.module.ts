import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Link, LinkSchema } from './link.schema';
import { LinksRepository } from './links.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Link.name, schema: LinkSchema }]),
  ],
  providers: [LinksService, LinksRepository],
  exports: [LinksService],
})
export class LinksModule {}
