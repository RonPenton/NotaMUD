import { GenericMessage } from './messages/GenericMessage';
import { Message } from '../server/messages/index';
import * as Messages from '../server/messages/index';
import React from "react";
import * as ReactDOM from 'react-dom';
import { bind } from "decko";
import io from 'socket.io-client';

import { GameHeader } from "./GameHeader";
import { OutputArea } from "./components/OutputArea";
import { InputArea } from "./components/InputArea";

import './css/styles.scss';

export interface ClientProps {
    username: string;
}

export interface MessageBundle {
    message: Message;
    control: JSX.Element;
}

export interface ClientState {
    messages: MessageBundle[];
}

export class Client extends React.Component<ClientProps, ClientState> {
    readonly socket: SocketIOClient.Socket;
    constructor() {
        super();

        this.state = { messages: [{ message :{ type: 'system', message: '' }, control: <GenericMessage>Connecting...</GenericMessage>}] };

        //this.addMessage()

        this.socket = io('', { transports: ['websocket'] });
        this.setupSocket();
    }

    private addMessage(message: Message, control: JSX.Element) {
        const bundle = { message: message, control: control };
        this.setState({ messages: this.state.messages.concat(bundle)});
    }

    private setupSocket() {
        this.socketOn<Messages.System>('system', this.socket, message => {
            this.addMessage(message, <GenericMessage>message.message</GenericMessage>);
        });
        this.socketOn<Messages.Error>('error-message', this.socket, message => {
            this.addMessage(message, <GenericMessage>message.message</GenericMessage>);
        });
    }

    private socketOn<T extends Messages.Message>(
        type: T['type'],
        socket: SocketIOClient.Socket,
        callback: (message: T) => void) {

        socket.on(type, (data: any) => {
            const message = { type, ...data } as T;
            callback(message);
        });
    }

    public render() {
        return (
            <div className="game">
                <GameHeader username={this.props.username} />
                <OutputArea messages={this.state.messages} />
                <InputArea newInput={this.handleInput} />
            </div>
        );
    }

    @bind
    private handleInput(command: string) {
        console.log(command);
    }

}

declare var document: {
    username: string;
} & Document;

ReactDOM.render(React.createElement(Client, { username: document.username }), document.getElementById("container"));
