import { ReorderService } from './reorder.service';

describe('ReorderService', () => {
  let service: ReorderService;

  beforeEach(() => {
    service = new ReorderService();
  });

  describe('reorderWithNull', () => {
    it('pushes null items to the bottom', () => {
      const result = service.reorderWithNull(null, 1);

      expect(result).toEqual(-1);
    });

    it('subtracts a from b', () => {
      const result = service.reorderWithNull(10, 5);

      expect(result).toEqual(5);
    });
  });
});
