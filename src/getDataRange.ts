import type { Range } from './ScatterPlot';

export function getDataRange(coords: Float32Array): Range
{
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < coords.length; i += 2)
    {
        const x = coords[i];
        const y = coords[i + 1];

        if (x < minX)
        {
            minX = x;
        }
        if (x > maxX)
        {
            maxX = x;
        }
        if (y < minY)
        {
            minY = y;
        }
        if (y > maxY)
        {
            maxY = y;
        }
    }

    return {
        minX,
        maxX,
        minY,
        maxY,
    };
}

