import { Type } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { Field } from '../decorators';
import { getFieldsAndDecoratorForType } from '../schema-builder/utils/get-fields-and-decorator.util';
import {
  applyIsOptionalDecorator,
  ClassDecoratorFactory,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';

export function PartialType<T>(
  classRef: Type<T>,
  decorator?: ClassDecoratorFactory,
): Type<Partial<T>> {
  const { fields, decoratorFactory } = getFieldsAndDecoratorForType(classRef);

  abstract class PartialObjectType {}
  if (decorator) {
    decorator({ isAbstract: true })(PartialObjectType);
  } else {
    decoratorFactory({ isAbstract: true })(PartialObjectType);
  }

  inheritValidationMetadata(classRef, PartialObjectType);
  inheritTransformationMetadata(classRef, PartialObjectType);

  fields.forEach((item) => {
    if (isFunction(item.typeFn)) {
      /**
       * Execute type function eagarly to update the type options object (before "clone" operation)
       * when the passed function (e.g., @Field(() => Type)) lazily returns an array.
       */
      item.typeFn();
    }
    Field(item.typeFn, { ...item.options, nullable: true })(
      PartialObjectType.prototype,
      item.name,
    );
    applyIsOptionalDecorator(PartialObjectType, item.name);
  });

  Object.defineProperty(PartialObjectType, 'name', {
    value: `Partial${classRef.name}`,
  });
  return PartialObjectType as Type<Partial<T>>;
}
