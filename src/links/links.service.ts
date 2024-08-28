import { Injectable } from '@nestjs/common';
import { LinksRepository } from './links.repository';
import { Link } from './link.schema';
import { CreateLinkDto } from './dto/create-link.dto';
import { v4 as uuidv4 } from 'uuid';
import { FindLinkDto } from './dto/find-link.dto';
import { DeleteLinkDto } from './dto/delete-link.dto';

@Injectable()
export class LinksService {
  constructor(private readonly linksRepository: LinksRepository) {}

  async saveLink(link: CreateLinkDto): Promise<Link> {
    const code: string = uuidv4();
    return this.linksRepository.create({ url: link.url, code });
  }

  async deleteLink(link: DeleteLinkDto): Promise<number> {
    return this.linksRepository.deleteOne({ code: link.code });
  }

  async findLink(link: FindLinkDto): Promise<Link> {
    return this.linksRepository.findOne({ code: link.code });
  }

  async findAllLinks(): Promise<Link[]> {
    return this.linksRepository.find({});
  }
}
