import { In } from '../../server/utils/linq';
import { Placement } from './IconBadgeRun';
import { GameIcon } from './GameIcon';
import React from 'react';

export type IconBadgeProps = {
    url: string;
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
}

export type FullIconBadgeProps = {
    translateX?: number;
    translateY?: number;
    scale?: number;
    placement?: Placement;
} & IconBadgeProps;

export type IconBadgeState = {
    foregroundPath?: string;
}

export class IconBadge extends React.PureComponent<FullIconBadgeProps, IconBadgeState> {
    constructor(props: IconBadgeProps) {
        super(props);
        this.state = {};
        GameIcon.loadSvg(this.props.url).then(doc => this.load(doc)).catch(e => alert(e));
    }

    private load(doc: Document) {
        const svg = doc.firstChild as SVGElement;
        const foreground = svg.lastElementChild as SVGPathElement;

        this.setState({
            ...this.state,
            foregroundPath: foreground.attributes.getNamedItem("d").value
        });
    }

    public static getTranslateCoordinates(scale: number, tx?: number, ty?: number, placement?: Placement) {
        const size = scale * 512;
        if (placement) {
            const x = In(placement, "top-left", "bottom-left") ? 0 : 512 - (size / 2);
            const y = In(placement, "top-left", "top-right") ? 0 : 512 - (size / 2);
            return { x, y, size };
        }

        return { x: tx || 0, y: ty || 0, size };
    }

    render() {
        if (!this.state.foregroundPath) return null;

        const scale = this.props.scale || 0.5;
        const { x, y } = IconBadge.getTranslateCoordinates(scale, this.props.translateX, this.props.translateY, this.props.placement);

        const transform = `translate(${x},${y}) scale(${scale})`;

        const bg = this.props.backgroundColor || "#000";
        const bc = this.props.borderColor || "#FFF";
        const fg = this.props.color || "#FFF";

        return (
            <g transform={transform}>
                <circle cx="128" cy="128" r="128" fill={bg}></circle>
                <circle stroke={bc} fill={bg} stroke-width="18" cx="128" cy="128" r="101"></circle>
                <path fill={fg} d={this.state.foregroundPath}></path>
            </g>
        );
    }
}
