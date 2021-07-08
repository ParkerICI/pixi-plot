import type { InteractionEvent } from 'pixi.js';
import { Graphics, Point, Rectangle  } from 'pixi.js';
import { Container } from 'pixi.js';
import { Signal } from 'typed-signals';

interface Node
{
    view: Container;
    x: number;
    y: number;
    _isDown?: boolean;
}

let UID = 0;

export class RectangleSelection
{
    public view = new Container();
    public firstRun = true;
    public id = UID++;

    public nodes: Node[] = [];
    public color: number;
    public onUpdateStart: Signal<(RectangleSelection) => void > = new Signal();
    public onUpdateEnd: Signal<(RectangleSelection) => void> = new Signal();
    public onRemove: Signal<(RectangleSelection) => void> = new Signal();

    private readonly _isDown: boolean;
    private _currentNode: Node;
    private readonly _shapeView: Graphics;
    private readonly _shape: Rectangle;

    constructor()
    {
        this.color = 0xFF0000;// Math.random() * 0xffffff;

        this._shape = new Rectangle(100, 100, 100, 100);
        this._shapeView = new Graphics();

        this.view.addChild(this._shapeView);

        this._addNode(0, 0);
        this._addNode(0.5, 0);
        this._addNode(1, 0);
        this._addNode(0, 0.5);
        this._addNode(1, 0.5);
        this._addNode(0, 1);
        this._addNode(0.5, 1);
        this._addNode(1, 1);

        this._makeDraggable();
    }

    get shape(): Rectangle
    {
        return this._shape;
    }

    public init(position: Point)
    {
        this._shape.x = position.x;
        this._shape.y = position.y;

        this._shape.width = 0;
        this._shape.height = 0;

        this._startNode(this.nodes[this.nodes.length - 1]);
    }

    public update()
    {
        const shape = this._shape;

        let { x: rx, y: ry, width: rw, height: rh } = shape;

        // flip rectangle if it has negative width and height..
        // so hit area works!
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

        this._shapeView.clear()
            .beginFill(this.color, 0.1)
            .lineStyle(1, this.color)
            .drawRect(rx, ry, rw, rh);

        this.nodes.forEach((e) =>
        {
            e.view.x = shape.x + (shape.width * e.x);
            e.view.y = shape.y + (shape.height * e.y);
        });
    }

    public remove()
    {
        this.onRemove.emit(this);
    }

    private _startNode(node: Node)
    {
        node._isDown = true;
        this._currentNode = node;
        this.onUpdateStart.emit(this);
    }

    private _moveNode(node: Node, position: Point)
    {
        if (node.x !== 0.5)
        {
            const lastLeft = this._shape.x;
            const lastRight = lastLeft + this._shape.width;

            this._currentNode.view.x = position.x;
            this._shape.x += (position.x - lastLeft) * (1 - node.x);
            this._shape.width += (lastLeft - position.x) * (1 - node.x);
            this._shape.width += (position.x - lastRight) * (node.x);
        }

        if (node.y !== 0.5)
        {
            const lastTop = this._shape.y;
            const lastBottom = this._shape.y + this._shape.height;

            this._currentNode.view.y = position.y;
            this._shape.y += (position.y - this._shape.y) * (1 - node.y);
            this._shape.height += (lastTop - position.y) * (1 - node.y);
            this._shape.height += (position.y - lastBottom) * (node.y);
        }
    }

    private _endNode(node: Node)
    {
        node._isDown = false;

        if (this._validateShape())
        {
            this.onUpdateEnd.emit(this);
        }
    }

    private _makeDraggable()
    {
        const view = this._shapeView;

        view.interactive = true;

        let isDown = false;
        const offset = new Point();

        // @ts-ignore
        view.on('pointerdown', (e: InteractionEvent) =>
        {
            if (e.data.originalEvent.ctrlKey)
            {
                this.remove();

                return;
            }

            const position = this.view.toLocal(e.data.global);

            offset.x = this._shape.x - position.x;
            offset.y = this._shape.y - position.y;

            isDown = true;//

            this.onUpdateStart.emit(this);
        });
        // @ts-ignore
        view.on('pointermove', (e: InteractionEvent) =>
        {
            if (isDown)
            {
                const position = this.view.toLocal(e.data.global);

                this._shape.x = position.x + offset.x;
                this._shape.y = position.y + offset.y;
            }
        });

        // @ts-ignore
        view.on('pointerupoutside', () =>
        {
            isDown = false;
        });
        // @ts-ignore
        view.on('pointerup', () =>
        {
            if (this._validateShape())
            {
                this.onUpdateEnd.emit(this);
            }
            isDown = false;
        });
    }

    private _addNode(x: number, y: number)
    {
        const view = new Graphics().beginFill(this.color).drawCircle(0, 0, 5);

        view.interactive = true;

        const node = {
            view,
            x,
            y,
            _isDown: false,
        };

        // @ts-ignore
        view.on('pointerdown', () =>
        {
            this._startNode(node);
        });
        // @ts-ignore
        view.on('pointermove', (e: InteractionEvent) =>
        {
            if (node._isDown)
            {
                this._moveNode(node, this.view.toLocal(e.data.global));
            }
        });
        // @ts-ignore
        view.on('pointerupoutside', () =>
        {
            this._endNode(node);
        });
        // @ts-ignore
        view.on('pointerup', () =>
        {
            this._endNode(node);
        });

        this.nodes.push(node);
        this.view.addChild(node.view);
    }

    private _validateShape(): boolean
    {
        if (this._shape.width === 0 || this._shape.height === 0)
        {
            return false;
        }

        return true;
    }
}
