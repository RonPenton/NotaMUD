import { Generic, handle } from './commands/index';
import { ErrorComponent } from './commands/error';
import { split } from '../server/utils/parse';
import React from "react";
import * as ReactDOM from 'react-dom';
import io from 'socket.io-client';
import * as moment from 'moment';
import { bind } from "decko";
import * as deepFreeze from 'deep-freeze';

import { GameHeader } from "./GameHeader";
import { OutputArea } from "./components/OutputArea";
import { InputArea } from "./components/InputArea";
import * as Messages from '../server/messages';
import { In } from "../server/utils/linq";
import { clientGameDb } from './components/MiniMap';

import './css/styles.scss';

import { install as installCommands } from './commands/install-commands';
installCommands();

declare var document: {
    uniquename: string;
    name: string;
    actorid: number;
} & Document;

export const User = deepFreeze({
    uniquename: document.uniquename,
    name: document.name,
    id: document.actorid
});

type ConnectionState = "disconnected" | "connecting" | "connected";

export interface ClientState {
    outputs: JSX.Element[];
    connectionState: ConnectionState;
}

export interface GameContext {
    addOutput: (output: JSX.Element) => void;
    addRoomInformation: (room: Messages.RoomDescription) => void;
}

export class App extends React.Component<{}, ClientState> implements GameContext {
    inputArea: InputArea | null = null;
    readonly socket: SocketIOClient.Socket;

    constructor(props: {}) {
        super(props);
        this.state = { outputs: [this.getConnectingMessage()], connectionState: "connecting" };
        this.socket = io('', { transports: ['websocket'] });
        this.setupSocket(this.socket);
    }

    private getSystemMessage(message: string) {
        return <Generic time={moment().toISOString()}>{message}</Generic>;
    }

    private getErrorMessage(message: string) {
        return <ErrorComponent time={moment().toISOString()}>{message}</ErrorComponent>;
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
        return <div className="user-input">{`${text}`}</div>;;
    }

    public addOutput(output: JSX.Element) {
        this.setState({ outputs: this.state.outputs.concat(output) });
    }

    private setupSocket(socket: SocketIOClient.Socket) {
        socket.on('message', (message: Messages.TimedMessage) => {
            this.processMessageFromServer(message);
        });

        socket.on('connect_timeout', () => {
            this.addOutput(this.getTimeoutMessage());
            this.setState({ connectionState: "disconnected" });
        });

        socket.on('connect_error', (error: any) => {
            console.log(error);
            if (this.state.connectionState != "disconnected") {
                this.addOutput(this.getTimeoutMessage());
                this.setState({ connectionState: "disconnected" });
            }
        });

        socket.on('disconnect', () => {
            this.addOutput(this.getDisconnectedMessage());
            this.setState({ connectionState: "disconnected" });
        });
    }

    private processMessageFromServer(message: Messages.TimedMessage) {
        switch (message.type) {
            case 'connected':
                this.setState({ connectionState: "connected" });
                break;
        }

        handle(message, this);
        return;
    }

    public render() {
        return (
            <div className="game">
                <GameHeader username={User.name} />
                <OutputArea outputs={this.state.outputs} onFocusClick={this.focusClick} />
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
            outputs: this.state.outputs.concat(this.getConnectingMessage()),
            connectionState: "connecting"
        });
        this.socket.connect();
    }

    @bind
    private handleInput(command: string) {
        const text = command.trim();

        if (!text) {
            // send a "brief look" command if user presses "enter", to get bearing on their surroundings.
            this.sendMessage({ type: 'look', brief: true });
            return;
        }

        const { head, tail } = split(text);
        this.addOutput(this.getUserInputMessage(text));

        if (head == 'ping') {
            this.sendMessage({ type: 'ping' });
            return;
        }

        if (In(head, 'l', 'look')) {
            this.sendMessage({ type: 'look', subject: tail })
            return;
        }

        this.sendMessage({ type: 'text-command', message: text });
    }

    private sendMessage(message: Messages.Message) {
        this.socket.emit('message', Messages.TimeStamp(message));
    }

    public async addRoomInformation(room: Messages.RoomDescription) {
        await clientGameDb.addRoomReference(room);
    }
}

ReactDOM.render(React.createElement(App), document.getElementById("container"));
