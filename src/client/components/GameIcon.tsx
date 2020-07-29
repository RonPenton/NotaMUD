import React from 'react';
import Spinner from "./Spinner";

export type GameIconProps = {
    url: string;
    size: number;
} & GameIconPresetProps

export type GameIconPresetProps = {
    foreground: string;
    foregroundOpacity?: number,

    background: string;
    backgroundOpacity?: number;

    shadow?: Shadow;

    strokeWidth?: number;
    strokeColor?: string;
}

export interface Shadow {
    blur: number;
    color: string;
    side?: string;
    x?: number;
    y?: number;
}

let _iconId = 0;

export interface GameIconState {
    backgroundPath?: string;
    foregroundPath?: string;
}
export class GameIcon extends React.PureComponent<GameIconProps, GameIconState> {
    readonly id: number;
    constructor(props: GameIconProps) {
        super(props);
        this.state = {};
        this.id = _iconId++;
        GameIcon.loadSvg(this.props.url).then(doc => this.load(doc)).catch(e => alert(e));
    }

    public static loadSvg(url: string): Promise<Document> {
        return new Promise<Document>((resolve, reject) => {
            const req = new XMLHttpRequest;
            req.open("GET", url);
            req.onreadystatechange = () => {
                if (req.readyState == XMLHttpRequest.DONE && req.status == 200) {
                    if (!req.responseXML) {
                        reject("error loading SVG: " + url);
                        return;
                    }
                    resolve(req.responseXML);
                }
            }
            req.send();
        });
    }

    private load(doc: Document) {
        const svg = doc.firstChild as SVGElement;
        const background = svg.firstElementChild as SVGPathElement;
        const foreground = svg.lastElementChild as SVGPathElement;

        this.setState({
            ...this.state,
            backgroundPath: background.attributes.getNamedItem("d")?.value,
            foregroundPath: foreground.attributes.getNamedItem("d")?.value
        });
    }

    render() {
        if (!this.state.backgroundPath || !this.state.foregroundPath)
            return <Spinner />;
        const style = {
            width: `${this.props.size}px`,
            height: `${this.props.size}px`
        }
        const bopacity = this.props.backgroundOpacity === undefined ? 1 : this.props.backgroundOpacity;
        const fopacity = this.props.foregroundOpacity === undefined ? 1 : this.props.foregroundOpacity;
        const filter = this.props.shadow ? `url(#shadow-${this.id})` : undefined;
        return (
            <svg viewBox="0 0 512 512" style={style} className="game-icon">
                {this.renderDefs()}
                <path d={this.state.backgroundPath} fill={this.props.background} opacity={bopacity} />
                <path d={this.state.foregroundPath}
                    fill={this.props.foreground}
                    opacity={fopacity}
                    filter={filter}
                    stroke={this.props.strokeColor}
                    strokeWidth={this.props.strokeWidth}
                />
                {this.props.children}
            </svg>
        );
    }

    private renderDefs(): JSX.Element | null {
        if (!this.props || !this.props.shadow)
            return null;
        const isin = this.props.shadow.side == "in";
        const compositeOperator = isin ? "out" : "atop";
        const composite2Operator = isin ? "atop" : "over";
        const composite2in = isin ? "offset" : "SourceGraphic";
        const composite2in2 = isin ? "SourceGraphic" : "offset";
        const dx = this.props.shadow.x || 0;
        const dy = this.props.shadow.y || 0;
        const shadowId = `shadow-${this.id}`;
        return (
            <defs>
                <filter id={shadowId} height="300%" width="300%" x="-100%" y="-100%">
                    <feFlood floodColor={this.props.shadow.color} result="flood"></feFlood>
                    <feComposite in="flood" in2="SourceGraphic" operator={compositeOperator} result="composite"></feComposite>
                    <feGaussianBlur in="composite" stdDeviation={this.props.shadow.blur} result="blur"></feGaussianBlur>
                    <feOffset result="offset" dx={dx} dy={dy}></feOffset>
                    <feComposite in={composite2in} in2={composite2in2} operator={composite2Operator}></feComposite>
                </filter>
            </defs>
        );
    }
}

export const Presets /*: { [key: string]: GameIconPresetProps }*/ = {
    Default: {
        background: "#000",
        foreground: "#fff"
    },
    Negatif: {
        background: "#fff",
        foreground: "#000"
    },
    Transparent: {
        background: "#000",
        backgroundOpacity: 0,
        foreground: "#fff"
    },
    Fire: {
        background: "#f44242",
        foreground: "#fdeb05",
        shadow: {
            blur: 20,
            color: "#fdeb05"
        }
    },
    Ice: {
        background: "#156de2",
        foreground: "#5ae9ff",
        shadow: {
            blur: 15,
            color: "#fff",
            x: 15,
            side: "in"
        }
    },
    Forest: {
        background: "#7c432f",
        foreground: "#2ad422"
    },
    Silver: {
        background: "#6b6b6b",
        foreground: "#e8e8e8",
        shadow: {
            blur: 0,
            y: 10,
            color: "#fff"
        }
    },
    Sun: {
        background: "#f8e71c",
        foreground: "#e3aa00",
        shadow: {
            blur: 15,
            color: "#e3aa00"
        }
    },
    Poison: {
        background: "#334033",
        foreground: "#0f0",
        shadow: {
            blur: 15,
            color: "#0f0"
        }
    },
    Gold: {
        background: "#3E320A",
        foreground: "#F5C823",
        shadow: {
            blur: 10,
            color: "#F5C823"
        },
        strokeWidth: 4,
        strokeColor: "#F3D771"
    },
    Air: {
        background: "#48baff",
        foreground: "#FFF",
        shadow: {
            blur: 20,
            color: "#FFF"
        }
    },
    Holy: {
        background: "#48baff",
        foreground: "#ffeb00",
        shadow: {
            blur: 30,
            color: "#FFF"
        },
        strokeWidth: 12,
        strokeColor: "#ffeeaf"
    },
    Crimson: {
        background: "#390000",
        foreground: "#b60015",
        shadow: {
            blur: 20,
            color: "#ff0000",
            x: 15,
            y: 15,
            side: "in"
        },
        strokeWidth: 10,
        strokeColor: "#6a000b"
    },
}
