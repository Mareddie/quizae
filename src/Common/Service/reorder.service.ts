import { Injectable } from '@nestjs/common';

@Injectable()
export class ReorderService {
  // Implementation of a commonly used reorder function. Takes into consideration null values.
  reorderWithNull(a: null | number, b: null | number): number {
    if (a === null || b === null) {
      return -1;
    }

    return a - b;
  }
}
