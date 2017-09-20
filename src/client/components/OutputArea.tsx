import React from 'react';
import { MessageBundle } from '../Client';


export interface OutputAreaProps {
    messages: MessageBundle[];
}

export class OutputArea extends React.Component<OutputAreaProps> {
    render() {
        const messages = this.props.messages.map(x => x.control);
        return <div className="output-area">{messages}</div>;
    }
}

