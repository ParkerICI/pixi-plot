import { Container, Graphics } from 'pixi.js';

import { AxisView } from './AxisView';
import { ScatterMesh } from './ScatterMesh';
import type { ScatterPlotOptions, ScatterViewData, Size } from './ScatterPlot';

const meshPool: ScatterMesh[] = [];

export class ScatterView
{
    public readonly view: Container = new Container();

    public scatterViewContainer: Container = new Container();

    private readonly _background: Graphics = new Graphics();
    private _data: ScatterViewData;

    private _size: Size;

    private readonly _axis: AxisView;
    private readonly _gridSize: Size;

    constructor({
        size = { width: 400, height: 400 },
        range = { maxX: 1000, maxY: 1000, minX: 0, minY: 0 },
        backgroundColor = 0x999999,
    }: ScatterPlotOptions)
    {
        this._size = size;

        const padding = 40;

        this._gridSize = { width: size.width - padding, height: size.height - padding };

        this._background.beginFill(backgroundColor)
            .drawRect(0, 0, size.width, size.height);

        this._axis = new AxisView();
        this._axis.setRange(range);
        this._axis.setSize(size);

        this.view.addChild(this._background, this.scatterViewContainer, this._axis.view);

        // this.view.x = padding;
        this.scatterViewContainer.x = padding;
    }

    public setSize(size: Size)
    {
        this._size = size;
    }

    public set(data: ScatterViewData): void
    {
        this._data = data;

        this.scatterViewContainer.children.forEach((mesh) =>
        {
            this.scatterViewContainer.removeChild(mesh);
            meshPool.push(mesh as ScatterMesh);
        });

        data.selections.forEach((selection) =>
        {
            const mesh = meshPool.pop() ?? new ScatterMesh();

            mesh.color = selection.color;
            mesh.setRange(data.range);
            mesh.setSize(this._gridSize);
            mesh.update(selection.coords);

            this.scatterViewContainer.addChild(mesh);
        });
    }
}
