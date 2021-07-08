import type { Renderer } from 'pixi.js';
import { utils } from 'pixi.js';
import { Point } from 'pixi.js';
import { Buffer, Container, DRAW_MODES, Geometry, Shader, State } from 'pixi.js';

import type { Range, Size } from './ScatterPlot';

export interface ScatterPlotOptions
{
    width?: number;
    height?: number;
    backgroundColor?: number;
}

export class ScatterMesh extends Container
{
    public view: Container = new Container();
    public state: State;

    private readonly _geometry: Geometry;
    private readonly _shader: Shader;
    private readonly _buffer: Buffer;
    private _range: Range;
    private _size: Size;

    constructor()
    {
        super();

        this._buffer = new Buffer();

        this._geometry = new Geometry()
            .addAttribute('aVertexPosition', this._buffer);

        this._shader = Shader.from(`

            attribute vec2 aVertexPosition;
        
            uniform mat3 projectionMatrix;
            uniform vec2 uRange;

            void main(void)
            {
                gl_PointSize = 1.0;

                vec2 finalPosition = aVertexPosition * uRange;

                gl_Position = vec4((projectionMatrix * vec3(finalPosition, 1.0)).xy, 0.0, 1.0);
            }
        `,
        `   
            uniform vec3 uColor;

             void main(void)
            {
              
                gl_FragColor = vec4(uColor, 1.);// * 0.4;
            }

        `,
        {
            uRange: new Point(1, 1),
            uColor: [0, 0, 0],
        });

        this.state = State.for2d();
        this._range = { x: 100, y: 100 };
    }

    set color(value: number)
    {
        utils.hex2rgb(value, this._shader.uniforms.uColor);
    }

    get color(): number
    {
        return utils.rgb2hex(this._shader.uniforms.uColor);
    }

    public setRange(range: Range): void
    {
        this._range = { ...range };
    }

    public setSize(size: Size): void
    {
        this._size = { ...size };
    }

    public render(renderer: Renderer)
    {
        if (this._buffer.data.length === 0) return;

        const shader = this._shader;

        shader.uniforms.uAlpha = this.worldAlpha;

        renderer.batch.flush();

        // bind and sync uniforms..
        shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
        shader.uniforms.uRange.x = this._size.width / this._range.x;
        shader.uniforms.uRange.y = this._size.height / this._range.y;

        renderer.shader.bind(shader);

        // set state..
        renderer.state.set(this.state);

        // bind the geometry...
        renderer.geometry.bind(this._geometry, shader);

        // then render it
        renderer.geometry.draw(DRAW_MODES.POINTS);
    }

    public update(data: Float32Array): void
    {
        this._buffer.update(data);
    }
}
