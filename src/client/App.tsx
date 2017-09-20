import React from "react";
import * as ReactDOM from 'react-dom';
import io from 'socket.io-client';
import { bind } from "decko";
import * as deepFreeze from 'deep-freeze';

import { GameHeader } from "./GameHeader";
import { OutputArea } from "./components/OutputArea";
import { InputArea } from "./components/InputArea";
import { Message } from '../server/messages/index';

import './css/styles.scss';

declare var document: {
    username: string;
    userDisplayname: string;
} & Document;

export const User = deepFreeze({
    name: document.username,
    displayName: document.userDisplayname
});

export type OutputMessage = Message & {
    __key: number;
}

let lastMessageId = 0;

type ConnectionState = "disconnected" | "connecting" | "connected";

export interface ClientState {
    messages: OutputMessage[];
    connectionState: ConnectionState;
}

export class App extends React.Component<{}, ClientState> {
    readonly socket: SocketIOClient.Socket;
    constructor() {
        super();

        this.state = { messages: [this.getConnectingMessage()], connectionState: "connecting" };

        this.socket = io('', { transports: ['websocket'] });
        this.setupSocket();
    }

    private getConnectingMessage() {
        const text = "Connecting...";
        return this.bundleMessage({ type: 'system', message: text });
    }

    private bundleMessage(message: Message) {
        return { ...message, __key: lastMessageId++ };
    }

    private addMessage(message: Message) {
        const bundle = this.bundleMessage(message);
        this.setState({ messages: this.state.messages.concat(bundle) });
    }

    private setupSocket() {
        this.socket.on('message', (message: Message) => {
            this.incomingMessage(message);
        });

        this.socket.on('disconnect', () => {
            this.setState({ connectionState: "disconnected" });
        });
    }

    private incomingMessage(message: Message) {
        //TODO: kind of a weak design here. Messages that don't output to the screen need to 
        // remember to 'return' after they're handled. Think of a better way to do this.

        switch (message.type) {
            case 'connected':
                this.setState({ connectionState: "connected" });
                break;
        }

        this.addMessage(message);
        return;
    }

    public render() {
        return (
            <div className="game">
                <GameHeader username={User.displayName} />
                <OutputArea messages={this.state.messages} />
                {this.getInputArea()}
            </div>
        );
    }

    private getInputArea() {
        if (this.state.connectionState == "connected")
            return <InputArea newInput={this.handleInput} />;

        const disabled = this.state.connectionState == "connecting" ? { disabled: true } : {};
        return (
            <div className="input-area">
                <button className="button tiny" onClick={this.connectClick} {...disabled}>Connect</button>
            </div>);
    }

    @bind
    private connectClick() {
        if (this.state.connectionState != "disconnected")
            return;

        this.setState({
            messages: this.state.messages.concat(this.getConnectingMessage()),
            connectionState: "connecting"
        });
        this.socket.connect();
    }

    @bind
    private handleInput(command: string) {
        this.sendMessage({
            type: 'talk-global',
            from: User.name,
            message: command
        });
    }

    private sendMessage(message: Message) {
        this.socket.emit('message', message);
    }
}

ReactDOM.render(React.createElement(App), document.getElementById("container"));
