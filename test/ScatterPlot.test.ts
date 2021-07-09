import { Renderer, Ticker } from 'pixi.js';
import { gateRectangle } from '../src/gateRectangle';
import { getDataRange } from '../src/getDataRange';
import type { ScatterData } from '../src/ScatterPlot';
import { ScatterPlot } from '../src/ScatterPlot';

function generateRandomSet(size: number): ScatterData
{
    const ids = new Float32Array(size);
    const coords = new Float32Array(size * 2);

    for (let i = 0; i < ids.length; i++)
    {
        ids[i] = i;
        coords[i * 2] = 500 + (Math.random() * 500);
        coords[(i * 2) + 1] = 200 + (Math.random() * 500);
    }

    return {
        ids,
        coords,
        color: Math.random() * 0xffffff,
    };
}

describe('ScatterPlot', () =>
{
    it('should render a scatter plot', () =>
    {
        const renderer = new Renderer({ width: 400, height: 400 });

        document.body.appendChild(renderer.view);

        const scatterPlot =  new ScatterPlot({
            size: { width: 400, height: 400 },
            backgroundColor: 0xCCCCCC,
        });

        const randomData = generateRandomSet(10000);

        const range = getDataRange(randomData.coords);

        const data = {
            range,
            selections: [randomData],
        };

        scatterPlot.set(data);

        const selectionManager: Record<number, {data: ScatterData; id: number; color: number}> = {};

        scatterPlot.selectionLayer.onShapeCreated.connect((r, id) =>
        {
            const gatedData = gateRectangle(randomData, r);

            gatedData.color = Math.random() * 0xffffff;

            data.selections.push(gatedData);

            scatterPlot.set(data);

            selectionManager[id] = {
                data: gatedData,
                id,
                color: gatedData.color,
            };
        });

        scatterPlot.selectionLayer.onShapeUpdated.connect((r, id) =>
        {
            const selection =  selectionManager[id];
            const newRange = gateRectangle(randomData, r);

            selection.data.coords = newRange.coords;
            selection.data.ids = newRange.ids;
            selection.data.color = selection.color;

            scatterPlot.set(data);
        });

        scatterPlot.selectionLayer.onShapeRemoved.connect((id) =>
        {
            const index =  data.selections.indexOf(selectionManager[id].data);

            if (index !== -1)
            {
                data.selections.splice(index, 1);
            }

            delete selectionManager[id];

            scatterPlot.set(data);
        });

        Ticker.shared.add(() =>
        {
            renderer.render(scatterPlot.view);
        });
    });
});
