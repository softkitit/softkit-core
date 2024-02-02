import { Injectable } from '@nestjs/common';
import { I18nTranslations } from '../../generated/i18n.generated';
import { CatModel } from './cat.model';
import { I18nContext } from '../../../i18n.context';

@Injectable()
export class CatService {
  private cats: CatModel[] = [
    {
      id: 1,
      name: 'foo',
      age: 4,
    },
    {
      id: 2,
      name: 'bar',
      age: 6,
    },
  ];

  constructor() {}

  findAll(): CatModel[] {
    return this.cats;
  }

  findById(id: number): CatModel {
    const cat = this.cats.find((cat) => cat.id === id);
    if (!cat) {
      throw new Error('Cat not found');
    }

    cat.description =
      I18nContext.current<I18nTranslations>().translate('test.cat');
    return cat;
  }
}
