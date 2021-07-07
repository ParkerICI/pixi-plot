import type { InteractionEvent, IShape, Point, Renderer } from 'pixi.js';
import { Container, Graphics, Rectangle } from 'pixi.js';
import { Signal } from 'typed-signals';

import type { Range, Size } from './ScatterPlot';

export class SelectionLayer
{
    public view: Container = new Container();
    public onShapeDrawn: Signal<(shape: IShape) => void> = new Signal();

    private _isDown: boolean;
    private readonly _selectionView: Graphics;

    // TODO separate out to custom shape functions...
    private readonly _rectangleSelection = new Rectangle(0, 0, 1, 1);
    private readonly _adjustedRectangleSelection = new Rectangle(0, 0, 1, 1);
    private _shapeDirty = true;
    private _range: Range;
    private _size: Size;

    constructor()
    {
        // draw shapes!
        this.view.interactive = true;

        const hitArea = new Rectangle(0, 0, 400, 400);

        this.view.hitArea = hitArea;

        // const debug = new Graphics()
        //     .beginFill(0xFFCC00, 0.2)
        //     .drawRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);

        // this.view.addChild(debug);

        this.view.on('pointerdown', (e: InteractionEvent) =>
        {
            this._isDown = true;
            this._beginShape(this.view.toLocal(e.data.global));
        });

        this.view.on('pointermove', (e: InteractionEvent) =>
        {
            if (this._isDown)
            {
                this._updateShape(this.view.toLocal(e.data.global));
            }
        });

        this.view.on('pointerupoutside', () =>
        {
            this._isDown = false;
            this._endShape();
        });

        this.view.on('pointerup', () =>
        {
            this._isDown = false;
            this._endShape();
        });

        this._selectionView = new Graphics();
        this.view.addChild(this._selectionView);

        // intercept the render function...
        const render =  this.view.render.bind(this.view);

        // eslint-disable-next-line func-names
        this.view.render = (renderer: Renderer) =>
        {
            if (this._shapeDirty)
            {
                this._shapeDirty = false;

                this._selectionView.clear();

                this._selectionView.lineStyle(2, 0x000000, 1);
                this._selectionView.beginFill(0, 0.5);
                this._selectionView.drawShape(this._rectangleSelection);
            }
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

    private _beginShape(position: Point): void
    {
        const s = this._rectangleSelection;

        s.x = position.x;
        s.y = position.y;
        s.width = 0;
        s.height = 0;
        this._shapeDirty = true;
    }

    private _updateShape(position: Point)
    {
        const s = this._rectangleSelection;

        s.width = position.x - s.x;
        s.height = position.y - s.y;

        this._shapeDirty = true;
    }

    private _validateShape(): boolean
    {
        if (this._rectangleSelection.width === 0 || this._rectangleSelection.height === 0)
        {
            return false;
        }

        return true;
    }

    private _endShape()
    {
        this._shapeDirty = true;

        if (this._validateShape())
        {
            const sx = (this._range.x / this._size.width);
            const sy = (this._range.y / this._size.height);
            // adjust to range / size..

            const {
                _adjustedRectangleSelection: ar,
                _rectangleSelection: rs,
            } = this;

            ar.x = rs.x * sx;
            ar.y = rs.y * sy;
            ar.width = rs.width * sx;
            ar.height = rs.height * sy;

            this.onShapeDrawn.emit(ar);
        }
    }
}
