import React from 'react';
import { Size, Status } from './';


export interface ButtonProps {
    size?: Size;
    status?: Status;
    expanded?: boolean;
    hollow?: boolean;
    disabled?: boolean;
    clear?: boolean;
    onClick?: () => void;
}

export interface LinkButtonProps extends ButtonProps {
    href?: string;
}

const getButtonClasses = (props: ButtonProps): string[] => {
    let classes = ["button"];
    if (props.size && props.size != "medium") classes.push(props.size);
    if (props.expanded) classes.push("expanded");
    if (props.status) classes.push(props.status);
    if (props.hollow) classes.push("hollow");
    if (props.clear) classes.push("clear");
    if (props.disabled) classes.push("disabled");
    return classes;
}

export const Button: React.SFC<ButtonProps> = (props) => {
    const classes = getButtonClasses(props);
    return (<button type="button"
        className={classes.join(" ")}
        disabled={props.disabled}
        onClick={props.onClick}>
        {props.children}
    </button>);
}

export const LinkButton: React.SFC<LinkButtonProps> = (props) => {
    const classes = getButtonClasses(props);
    return (<a href={props.href}
        className={classes.join(" ")}
        aria-disabled={props.disabled}
        onClick={props.onClick}>
        {props.children}
    </a>);
}

export const CloseButton: React.SFC<{}> = (props) => {
    return (<button className="close-button" aria-label="Close alert" type="button">
        <span aria-hidden="true">{props.children || "&times;"}</span>
    </button>);
}