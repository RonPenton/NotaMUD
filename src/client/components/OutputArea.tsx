import React from 'react';
import { OutputMessage, User } from '../App';
import { GenericMessage, ErrorMessage } from '../messages/SimpleMessages';
import { bind } from 'decko';

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
            return <GenericMessage>{m.message}</GenericMessage>;

        case 'error':
            return <ErrorMessage>{m.message}</ErrorMessage>;

        case 'connected':
            if (m.name == User.name)
                return <GenericMessage>Connected!</GenericMessage>;
            else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
                return <GenericMessage>{`${m.displayName} has entered the game!`}</GenericMessage>;

        case 'disconnected':
            if (m.name == User.name)
                return empty;
            else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
                return <GenericMessage>{`${m.displayName} has disconnected!`}</GenericMessage>;

    }

    return empty;
}

