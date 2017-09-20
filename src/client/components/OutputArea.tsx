import React from 'react';
import { OutputMessage, User } from '../App';
import { GenericMessage, ErrorMessage } from '../messages/SimpleMessages';

export interface OutputAreaProps {
    messages: OutputMessage[];
}

export class OutputArea extends React.Component<OutputAreaProps> {
    render() {
        const messages = this.props.messages.map(x => <OutputMessageComponent key={x.__key} message={x} />);
        return <div className="output-area">{messages}</div>;
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

