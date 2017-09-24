import React from 'react';
import { bind } from 'decko';

import { OutputMessage, User } from '../App';
import * as Talk from './messages/talk';
import * as Debug from './messages/debug';
import * as Room from './messages/room';
import * as Simple from './messages/simple';

export interface OutputAreaProps {
    messages: OutputMessage[];
    onFocusClick: () => void;
}

export class OutputArea extends React.Component<OutputAreaProps> {

    private div: HTMLDivElement | null = null;
    private scrolledToBottom = true;
    private mouseDown = {
        x: 0,
        y: 0,
        down: false
    }

    render() {

        if (this.div) {
            const t = this.div;
            this.scrolledToBottom = Math.abs((t.scrollHeight - t.scrollTop) - t.offsetHeight) < 10;
        }

        const messages = this.props.messages.map(x => <OutputMessageComponent key={x.__key} message={x} />);
        return (
            <div className="output-area"
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                ref={(input) => this.div = input}>
                {messages}
            </div>);
    }

    @bind
    onMouseDown(evt: React.MouseEvent<HTMLDivElement>) {
        this.mouseDown = { x: evt.clientX, y: evt.clientY, down: true };
    }

    @bind
    onMouseUp(evt: React.MouseEvent<HTMLDivElement>) {
        if (this.mouseDown.x == evt.clientX && this.mouseDown.y == evt.clientY &&
            this.mouseDown.down == true && this.div) {
            this.props.onFocusClick();
        }
        this.mouseDown = { x: 0, y: 0, down: false };
    }

    componentDidMount() { this.fixScroll(); }

    componentDidUpdate() { this.fixScroll(); }

    private fixScroll() {
        if (this.div && this.scrolledToBottom) {
            this.div.scrollTop = this.div.scrollHeight;
        }
    }
}

export interface OutputMessageProps {
    message: OutputMessage;
}

const empty = <div style={{ display: "none" }} />;

const OutputMessageComponent: React.SFC<OutputMessageProps> = (props) => {
    const m = props.message;
    switch (m.type) {
        case 'system':
            return <Simple.Generic>{m.message}</Simple.Generic>;

        case 'error':
            return <Simple.Error>{m.message}</Simple.Error>;

        case 'user-input':
            return <Simple.UserInput text={m.message} />

        case 'pong':
            return <Debug.Pong stamp={m.originalStamp}></Debug.Pong>;

        case 'connected':
            if (m.from.uniquename == User.uniquename)
                return <Simple.Generic>Connected!</Simple.Generic>;
            else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
                return <Simple.Generic time={m.timeStampStr}>{`${m.from.name} has entered the game!`}</Simple.Generic>;

        case 'disconnected':
            if (m.from.uniquename == User.uniquename)
                return empty;
            else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
                return <Simple.Generic time={m.timeStampStr}>{`${m.from.name} has disconnected!`}</Simple.Generic>;

        case 'talk-global':
            return <Talk.Global {...m} />
        case 'talk-room':
            return <Talk.Room {...m} />
        case 'talk-private':
            return <Talk.Private {...m} />

        case 'room-description':
            return <Room.Description {...m} />

        case 'actor-moved':
            return <Room.Movement {...m} />
    }

    return empty;
}

