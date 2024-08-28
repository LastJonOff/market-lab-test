import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/abstract.schema';

@Schema({ versionKey: false })
export class Link extends AbstractDocument {
  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  code: string;
}

export const LinkSchema = SchemaFactory.createForClass(Link);
