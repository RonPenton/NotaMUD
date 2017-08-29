import React from 'react';
import { Size } from './';


export interface ButtonGroupProps {
    size?: Size;
    expanded?: boolean;
    stacked?: "small" | "medium" | "normal";
}

export const ButtonGroup: React.SFC<ButtonGroupProps> = (props) => {
    let classes = ["button-group"];
    if (props.size && props.size != "medium") classes.push(props.size);
    if (props.expanded) classes.push("expanded");
    switch(props.stacked) {
        case "small": classes.push("stacked-for-small"); break;
        case "medium": classes.push("stacked-for-medium"); break;
        case "normal": classes.push("stackedstacked"); break;
    }
    return (<div className={classes.join(" ")}>{props.children}</div>);
}