import { L } from '../../server/utils/linq';
import { IconBadge, IconBadgeProps } from './IconBadge';
import React from 'react';

export type Flow = "left" | "right" | "up" | "down";
export type Placement = "top-left" | "top-right" | "bottom-left" | "bottom-right";


export type IconBadgeRunProps = {
    flow?: Flow;
    placement?: Placement;
    scale?: number;
    items: IconBadgeProps[];
}

export class IconBadgeRun extends React.PureComponent<IconBadgeRunProps> {
    render() {
        const flow = this.props.flow || "left";
        const placement = this.props.placement || "bottom-right";
        const scale = this.props.scale || 0.5;
        const { x, y, size } = IconBadge.getTranslateCoordinates(scale, undefined, undefined, placement);
        const incX = (flow == "right" ? size : flow == "left" ? -size : 0) / 2;
        const incY = (flow == "up" ? -size : flow == "down" ? size : 0) / 2;

        const badges = L(this.props.items).selectIndex((props, i) => {
            return <IconBadge {...props} scale={scale} translateX={x + (i * incX)} translateY={y + (i * incY)} />
        });

        return badges as any as JSX.Element; // hack for React 16 return-arrays-from-render feature, not yet implemented in TypeScript.
    }
}
