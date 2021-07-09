import type { InteractionEvent, Point, Renderer } from 'pixi.js';
import { Container, Graphics, Rectangle } from 'pixi.js';
import { Signal } from 'typed-signals';

import  { RectangleSelection } from './RectangleSelection';
import type { Range, Size } from './ScatterPlot';

export class SelectionLayer
{
    public view: Container = new Container();
    public onShapeCreated: Signal<(rs: Rectangle, id: number) => void> = new Signal();
    public onShapeUpdated: Signal<(rs: Rectangle, id: number) => void> = new Signal();
    public onShapeRemoved: Signal<(id: number) => void> = new Signal();

    private _isCheckingForNewRect: boolean;
    private readonly _selectionView: Graphics;

    // TODO separate out to custom shape functions...
    private readonly _adjustedRectangleSelection = new Rectangle(0, 0, 1, 1);
    private _range: Range;
    private _size: Size;
    private readonly _renderSelections: RectangleSelection[] = [];
    private readonly _addNeyLayer: Graphics;
    private _startPosition: any;

    constructor()
    {
        // draw shapes!

        const hitArea = new Rectangle(0, 0, 400, 400);

        this._addNeyLayer = new Graphics()
            .beginFill(0xFFCC00, 0)
            .drawRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
        this._addNeyLayer.hitArea = hitArea;
        this._addNeyLayer.interactive = true;

        this.view.addChild(this._addNeyLayer);

        // @ts-ignore
        this._addNeyLayer.on('pointerdown', (e: InteractionEvent) =>
        {
            this._isCheckingForNewRect = true;
            this._startPosition = this.view.toLocal(e.data.global);
        });

        // @ts-ignore
        this._addNeyLayer.on('pointermove', (e: InteractionEvent) =>
        {
            if (this._isCheckingForNewRect)
            {
                const local = this.view.toLocal(e.data.global);

                const dx = local.x - this._startPosition.x;
                const dy = local.y - this._startPosition.y;
                const dist = Math.sqrt((dx * dx) + (dy * dy));

                if (dist > 5)
                {
                    this._isCheckingForNewRect = false;
                    this._beginShape(local);
                }
            }
        });

        // @ts-ignore
        this._addNeyLayer.on('pointerup', () =>
        {
            this._isCheckingForNewRect = false;
        });

        // @ts-ignore
        this._addNeyLayer.on('pointerupoutside', () =>
        {
            this._isCheckingForNewRect = false;
        });

        this._selectionView = new Graphics();
        this.view.addChild(this._selectionView);

        // intercept the render function...
        const render =  this.view.render.bind(this.view);

        // eslint-disable-next-line func-names
        this.view.render = (renderer: Renderer) =>
        {
            this._renderSelections.forEach((rectangleSelection) =>
            {
                rectangleSelection.update();
            });

            // TODO just override render again?

            render(renderer);
        };
    }

    public setSize(size: Size)
    {
        this._size = size;
    }

    public setRange(range: Range)
    {
        this._range = range;
    }

    //
    public removeSelection(id: number): void
    {
        const rs = this._renderSelections.find((rs) => rs.id === id);

        if (rs)
        {
            rs.onUpdateStart.disconnectAll();
            rs.onUpdateEnd.disconnectAll();
            rs.onRemove.disconnectAll();

            this.view.removeChild(rs.view);

            // TODO add pooling!
            this._renderSelections.splice(this._renderSelections.indexOf(rs), 1);
            this.onShapeRemoved.emit(id);
        }
    }

    private _beginShape(position: Point): void
    {
        const rs = new RectangleSelection();

        this._renderSelections.push(rs);

        this.view.addChild(rs.view);

        rs.init(position);

        rs.onUpdateStart.connect((rs) =>
        {
            this.view.addChild(rs.view);
        });

        rs.onUpdateEnd.connect(() =>
        {
            // adjust to range / size..
            const dx = this._range.maxX - this._range.minX;
            const dy = this._range.maxY - this._range.minY;

            const sx = (dx / this._size.width);
            const sy = (dy / this._size.height);
            const ar = this._adjustedRectangleSelection;
            const shape = rs.shape;

            const r = shape.width / this._size.width;
            const r2 = shape.height / this._size.height;

            ar.x = this._range.minX + (shape.x * sx);
            ar.y = this._range.minY + (shape.y * sy);
            ar.width = r * dx;
            ar.height = r2 * dy;

            // do stuff!
            if (rs.firstRun)
            {
                rs.firstRun = false;
                this.onShapeCreated.emit(ar, rs.id);
            }
            else
            {
                this.onShapeUpdated.emit(ar, rs.id);
            }
        });

        rs.onRemove.connect(() =>
        {
            this.removeSelection(rs.id);
        });
    }
}
