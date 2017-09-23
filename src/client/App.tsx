import React from "react";
import * as ReactDOM from 'react-dom';
import io from 'socket.io-client';
import * as moment from 'moment';
import { bind } from "decko";
import * as deepFreeze from 'deep-freeze';

import { GameHeader } from "./GameHeader";
import { OutputArea } from "./components/OutputArea";
import { InputArea } from "./components/InputArea";
import { Message, TimedMessage, TimeStamp } from '../server/messages/index';

import './css/styles.scss';

declare var document: {
    username: string;
    userDisplayname: string;
} & Document;

export const User = deepFreeze({
    uniquename: document.username,
    displayName: document.userDisplayname
});

export type OutputMessage = TimedMessage & {
    __key: number;
}

let lastMessageId = 0;

type ConnectionState = "disconnected" | "connecting" | "connected";

export interface ClientState {
    messages: OutputMessage[];
    connectionState: ConnectionState;
}

export class App extends React.Component<{}, ClientState> {
    inputArea: InputArea | null = null;
    readonly socket: SocketIOClient.Socket;

    constructor() {
        super();
        this.state = { messages: [this.getConnectingMessage()], connectionState: "connecting" };
        this.socket = io('', { transports: ['websocket'] });
        this.setupSocket(this.socket);
    }

    private getSystemMessage(message: string) {
        return this.bundleMessage({ type: 'system', timeStampStr: moment().toISOString(), message: message });
    }

    private getErrorMessage(message: string) {
        return this.bundleMessage({ type: 'error', timeStampStr: moment().toISOString(), message: message });
    }

    private getConnectingMessage() {
        return this.getSystemMessage("Connecting...");
    }

    private getDisconnectedMessage() {
        return this.getErrorMessage("Disconnected!");
    }

    private getTimeoutMessage() {
        return this.getErrorMessage("Connection timed out!");
    }

    private getUserInputMessage(text: string) {
        return this.bundleMessage({ type: 'user-input', timeStampStr: moment().toISOString(), message: text });
    }

    private bundleMessage(message: TimedMessage) {
        return { ...message, __key: lastMessageId++ };
    }

    private addMessage(message: TimedMessage) {
        const bundle = this.bundleMessage(message);
        this.setState({ messages: this.state.messages.concat(bundle) });
    }

    private setupSocket(socket: SocketIOClient.Socket) {
        socket.on('message', (message: TimedMessage) => {
            this.processMessageFromServer(message);
        });

        socket.on('connect_timeout', () => {
            this.addMessage(this.getTimeoutMessage());
            this.setState({ connectionState: "disconnected" });
        });

        socket.on('connect_error', (error: any) => {
            console.log(error);
            if(this.state.connectionState != "disconnected") {
                this.addMessage(this.getTimeoutMessage());
                this.setState({ connectionState: "disconnected" });
            }
        });

        socket.on('disconnect', () => {
            this.addMessage(this.getDisconnectedMessage());
            this.setState({ connectionState: "disconnected" });
        });
    }

    private processMessageFromServer(message: TimedMessage) {
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
                <OutputArea messages={this.state.messages} onFocusClick={this.focusClick} />
                {this.getInputArea()}
            </div>
        );
    }

    private getInputArea() {
        if (this.state.connectionState == "connected")
            return <InputArea ref={(input) => this.inputArea = input} newInput={this.handleInput} />;

        const disabled = this.state.connectionState == "connecting" ? { disabled: true } : {};
        return (
            <div className="input-area">
                <button className="button tiny" onClick={this.connectClick} {...disabled}>Connect</button>
            </div>);
    }

    @bind
    private focusClick() {
        if (this.inputArea) {
            this.inputArea.focus();
        }
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
        const text = command.trim();
        this.addMessage(this.getUserInputMessage(text));

        if (text == 'ping') {
            this.sendMessage({ type: 'ping' });
            return;
        }

        this.sendMessage({ type: 'client-command', message: text });
    }

    private sendMessage(message: Message) {
        this.socket.emit('message', TimeStamp(message));
    }
}

ReactDOM.render(React.createElement(App), document.getElementById("container"));
