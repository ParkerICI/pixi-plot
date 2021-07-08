import { Renderer, Ticker } from 'pixi.js';
import type { ScatterData } from '../src/ScatterPlot';
import { ScatterPlot } from '../src/ScatterPlot';

function generateRandomSet(size: number): ScatterData
{
    const ids = new Float32Array(size);
    const coords = new Float32Array(size * 2);

    for (let i = 0; i < ids.length; i++)
    {
        ids[i] = i;
        coords[i * 2] = (Math.random() * 1000);
        coords[(i * 2) + 1] = (Math.random() * 1000);
    }

    return {
        ids,
        coords,
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
            range: { x: 1000, y: 1000, minX: 0, minY: 0 },
            backgroundColor: 0xCCCCCC,
        });

        const randomData = generateRandomSet(10000);

        scatterPlot.set(randomData);

        Ticker.shared.add(() =>
        {
            renderer.render(scatterPlot.view);
        });
    });
});
