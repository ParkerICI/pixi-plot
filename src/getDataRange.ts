import type { Rectangle } from 'pixi.js';

import type { ScatterData } from './ScatterPlot';

export function gateRectangle({ ids, coords }: ScatterData, rect: Rectangle): ScatterData
{
    if (ids.length !== coords.length / 2)
    {
        throw new Error('[Gate Error] ids and cords array lengths do not line up');
    }

    let { x: rx, y: ry, width: rw, height: rh } = rect;

    // flip rectangle if it has negative width and height..
    if (rw < 0)
    {
        rx += rw;
        rw *= -1;
    }

    if (rh < 0)
    {
        ry += rh;
        rh *= -1;
    }

    let index = 0;
    const indexes = [];

    for (let i = 0; i < ids.length; i++)
    {
        const x = coords[i * 2];
        const y = coords[(i * 2) + 1];

        if (x >= rx && x < rx + rw)
        {
            if (y >= ry && y < ry + rh)
            {
                // match!
                indexes[index++] = i;
            }
        }
    }

    const newIds = new Float32Array(indexes.length);
    const newCoords = new Float32Array(indexes.length * 2);

    for (let i = 0; i < ids.length; i++)
    {
        const oldIndex = indexes[i];

        newIds[i] = ids[oldIndex];
        newCoords[i * 2] = coords[oldIndex * 2];
        newCoords[(i * 2) + 1] = coords[(oldIndex * 2) + 1];
    }

    return {
        ids: newIds,
        coords: newCoords,
    };
}

