import { Injectable, Logger } from '@nestjs/common';

import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Link } from './link.schema';
import { AbstractRepository } from 'src/abstarct.repository';

@Injectable()
export class LinksRepository extends AbstractRepository<Link> {
  protected readonly logger = new Logger(LinksRepository.name);

  constructor(
    @InjectModel(Link.name) userModel: Model<Link>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }
}
