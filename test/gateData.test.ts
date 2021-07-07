import { Rectangle } from 'pixi.js';
import { gateRectangle } from '../src/gateRectangle';

/**
 * o o o x
 * x o o x
 * x x x x
 * o o x x
 **/
const coords = new Float32Array([
    3, 0,
    0, 1, 3, 1,
    0, 2, 1, 2, 2, 2, 3, 2,
    2, 3, 3, 3,
]);

const ids = new Float32Array([
    0,
    1, 2,
    3, 4, 5, 6,
    9, 10,
]);

describe('Gate Data', () =>
{
    it('should throw an error if ids and coords to not have correct sizes', () =>
    {
        const rect = new Rectangle(0, 0, 3, 3);

        expect(() =>
        {
            gateRectangle({ ids: new Float32Array(2), coords }, rect);
        }).toThrow();
    });

    it('should correctly gate scatter data with a rectangle', () =>
    {
        const rect = new Rectangle(0, 0, 3, 3);

        const { ids: newIds, coords: newCords } = gateRectangle({ ids, coords }, rect);

        // add negative test..
        expect(newIds).toEqual(new Float32Array([1, 3, 4, 5]));
        expect(newCords).toEqual(new Float32Array([0, 1, 0, 2, 1, 2, 2, 2]));
    });

    it('should correctly gate scatter data with a rectangle with negative width or height', () =>
    {
        const rect = new Rectangle(3, 3, -3, -3);

        const { ids: newIds, coords: newCords } = gateRectangle({ ids, coords }, rect);

        // add negative test..
        expect(newIds).toEqual(new Float32Array([1, 3, 4, 5]));
        expect(newCords).toEqual(new Float32Array([0, 1, 0, 2, 1, 2, 2, 2]));
    });
});
