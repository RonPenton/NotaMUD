import React from 'react';

export const TopBar: React.SFC<{}> = (props) => {
    return <div className="top-bar">{props.children}</div>;
}

export const TopBarLeft: React.SFC<{}> = (props) => {
    return <div className="top-bar-left">{props.children}</div>;
}

export const TopBarRight: React.SFC<{}> = (props) => {
    return <div className="top-bar-right">{props.children}</div>;
}

export const TopBarMenu: React.SFC<{}> = (props) => {
    return <ul className="menu">{props.children}</ul>;
}

export const TopBarMenuTitle: React.SFC<{}> = (props) => {
    return <li className="menu-text">{props.children}</li>;
}

export interface TopBarMenuItemProps {
    href: string;
}

export const TopBarMenuItem: React.SFC<TopBarMenuItemProps> = (props) => {
    return <li><a href={props.href}>{props.children}</a></li>;
}