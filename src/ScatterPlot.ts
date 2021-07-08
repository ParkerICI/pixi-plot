import { Container, Graphics } from 'pixi.js';

import { gateRectangle } from './gateRectangle';
import { ScatterMesh } from './ScatterMesh';
import { SelectionLayer } from './SelectionLayer';

export interface ScatterData
{
    ids: Float32Array;
    coords: Float32Array;
}

export interface Range
{
    x: number;
    y: number;
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
    public view: Container = new Container();
    public scatterViewContainer: Container = new Container();

    private readonly _background: Graphics = new Graphics();
    private _data: ScatterData;

    private readonly _scatterMesh: ScatterMesh;
    // private readonly _scatterMeshes: ScatterMesh[] = [];
    private readonly _selectionLayer: SelectionLayer;
    private readonly _size: Size;
    private readonly _range: Range;

    private readonly _selections: Record<number, Selection> = {};

    constructor({
        size = { width: 400, height: 400 },
        range = { x: 1000, y: 1000 },
        backgroundColor = 0x999999,
    }: ScatterPlotOptions)
    {
        this._size = size;
        this._range = range;

        this._background.beginFill(backgroundColor)
            .drawRect(0, 0, size.width, size.height);

        this._scatterMesh = new ScatterMesh();

        this._scatterMesh.setRange(this._range);
        this._scatterMesh.setSize(this._size);

        this._selectionLayer = new SelectionLayer();
        this._selectionLayer.setRange(this._range);
        this._selectionLayer.setSize(this._size);

        this.view.addChild(this._background, this.scatterViewContainer, this._selectionLayer.view);

        this.scatterViewContainer.addChild(this._scatterMesh);

        this._selectionLayer.onShapeCreated.connect((r, id) =>
        {
            const gatedData = gateRectangle(this._data, r);

            const view = new ScatterMesh();

            view.color = 0xFFFFFF * Math.random();
            view.setRange(this._range);
            view.setSize(this._size);

            this._selections[id] = {
                data: gatedData,
                id,
                view,
            };

            this.scatterViewContainer.addChild(view);

            view.update(gatedData.coords);
        });

        this._selectionLayer.onShapeUpdated.connect((r, id) =>
        {
            const gatedData = gateRectangle(this._data, r);

            this._selections[id].data = gatedData;

            this._selections[id].view.update(gatedData.coords);

            this.scatterViewContainer.addChild(this._selections[id].view);
        });

        this._selectionLayer.onShapeRemoved.connect((id) =>
        {
            this.scatterViewContainer.removeChild(this._selections[id].view);
            delete this._selections[id];
        });
    }

    /**
     * data format should be [x, y, x, y]
     **/
    public set(data: ScatterData): void
    {
        // TODO - if users can be trusted.. should we clone??
        this._data = data;

        this.redraw();
    }

    public redraw(): void
    {
        // redraw the graph..
        this._scatterMesh.update(this._data.coords);
    }
}
