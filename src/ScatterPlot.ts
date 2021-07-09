import { Container } from 'pixi.js';

import type { ScatterMesh } from './ScatterMesh';
import { ScatterView } from './ScatterView';
import { SelectionLayer } from './SelectionLayer';

export interface ScatterViewData
{
    range: Range;
    selections: ScatterData[];
}

export interface ScatterData
{
    ids: Float32Array;
    coords: Float32Array;
    color: number;
}

export interface Range
{
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
}

export interface Size
{
    width: number;
    height: number;
}

export interface ScatterPlotOptions
{
    size?: Size;
    range?: Range;
    backgroundColor?: number;
}

export interface Selection
{
    data: ScatterData;
    id: number;
    view: ScatterMesh;
}

export class ScatterPlot
{
    public readonly view = new Container();

    public readonly scatterView: ScatterView;
    public readonly selectionLayer: SelectionLayer;

    private readonly _range: Range;

    constructor(options: ScatterPlotOptions)
    {
        this._range = options.range;

        const padding = 40;

        const gridSize = { width: options.size.width - padding, height: options.size.height - padding };

        this.scatterView = new ScatterView(options);
        this.scatterView.setSize(gridSize);

        this.selectionLayer = new SelectionLayer();
        this.selectionLayer.setRange(this._range);
        this.selectionLayer.setSize(gridSize);

        this.view.addChild(this.scatterView.view, this.selectionLayer.view);
        this.selectionLayer.view.x = padding;
    }

    /**
     * data format should be [x, y, x, y]
     **/
    public set(data: ScatterViewData): void
    {
        this.scatterView.set(data);
        this.selectionLayer.setRange(data.range);
    }
}
