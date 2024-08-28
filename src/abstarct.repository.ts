import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  QueryOptions,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<any> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
    }

    return document;
  }

  async findOneWithPopulate(
    filterQuery: FilterQuery<TDocument>,
    populateFields?: string,
  ): Promise<any> {
    const document = await this.model
      .findOne(filterQuery, {}, { lean: true })
      .populate(populateFields);

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  async update(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    return this.model.updateOne(filterQuery, update, {
      lean: true,
      new: true,
    });
  }

  async find(filterQuery: FilterQuery<TDocument>, query?: any) {
    return this.model.find(filterQuery, {}, { lean: true, ...query });
  }

  async findWithPagination(
    filterQuery: FilterQuery<TDocument>,
    query: QueryOptions<TDocument> | null,
  ) {
    return {
      records: await this.model.find(filterQuery, {}, { lean: true, ...query }),
      total: await this.count({}),
    };
  }

  async count(filterQuery: FilterQuery<TDocument>) {
    return this.model.countDocuments(filterQuery).exec();
  }

  async deleteOne(filterQuery: FilterQuery<TDocument>): Promise<number> {
    const result = (await this.model.deleteOne(filterQuery)).deletedCount;
    if (result === 0) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }
    return result;
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>): Promise<number> {
    const result = (await this.model.deleteMany(filterQuery)).deletedCount;
    if (result === 0) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }
    return result;
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
