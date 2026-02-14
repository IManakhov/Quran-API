import { BadRequestException, PipeTransform } from '@nestjs/common';

export class PageIdPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    if (value < 1 || value > 604) {
      throw new BadRequestException('Invalid page number');
    }
    return value;
  }
}
