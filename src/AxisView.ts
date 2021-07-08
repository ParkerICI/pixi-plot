import type { Renderer } from 'pixi.js';
import { TextStyle } from 'pixi.js';
import { Text } from 'pixi.js';
import { Graphics } from 'pixi.js';

import type { Range, Size } from './ScatterPlot';

export class AxisView
{
    public view = new Graphics();

    private _size: any;
    private _range: Range;
    private _dirty: boolean;
    private readonly _xAxisLabel: Text;
    private readonly _yAxisLabel: Text;

    constructor()
    {
        // intercept the render function...
        const render =  this.view.render.bind(this.view);

        // eslint-disable-next-line func-names
        this.view.render = (renderer: Renderer) =>
        {
            if (this._dirty)
            {
                const padding = 40;

                this._dirty = false;

                this.view.clear()
                    .lineStyle(1, 0)
                    .moveTo(padding, 0)
                    .lineTo(padding, this._size.height - padding)
                    .lineTo(this._size.width, this._size.height - padding);

                this._xAxisLabel.x = padding + ((this._size.width - padding) / 2);
                this._xAxisLabel.y = (this._size.height - padding) + 14;

                this._yAxisLabel.rotation = -Math.PI / 2;
                this._yAxisLabel.x = padding - 12;
                this._yAxisLabel.y = (this._size.height - padding) / 2;
            }

            render(renderer);
        };

        const style = new TextStyle({
            fontSize: 12,
        });

        this._xAxisLabel = new Text('FSC-H', style);
        this._xAxisLabel.anchor.set(0.5, 0);
        this._xAxisLabel.roundPixels = true;

        this._yAxisLabel = new Text('FSC-A', style);
        this._yAxisLabel.anchor.set(0.5, 1);
        this._yAxisLabel.roundPixels = true;

        this.view.addChild(this._xAxisLabel, this._yAxisLabel);
    }

    public setSize(size: Size)
    {
        this._size = size;
        this._dirty = true;
    }

    public setRange(range: Range)
    {
        this._range = range;
        this._dirty = true;
    }
}
