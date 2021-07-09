import { getDataRange } from '../src/getDataRange';

const coords = new Float32Array([
    3, 0,
    0, 1, 3, 1,
    0, 2, 1, 2, 2, 2, 3, 2,
    2, 3, 3, 3,
]);

describe('Gate Data Range', () =>
{
    it('should return the correct data range', () =>
    {
        const range = getDataRange(coords);

        expect(range).toEqual({ minX: 0, maxX: 3, minY: 0, maxY: 3 });
    });
});
