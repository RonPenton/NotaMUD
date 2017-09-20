import React from "react";
import * as ReactDOM from "react-dom";
import { bind } from "decko";
//import io from 'socket.io-client';

import { GameHeader } from "./GameHeader";
import { InputArea } from "./components/InputArea";

import "./css/styles.scss";

export interface ClientProps {
    username: string;
}

export class Client extends React.Component<ClientProps> {
    public render() {
        return (
            <div className="game">
                <GameHeader username={this.props.username} />
                <div className="text-area"></div>
                <InputArea newInput={this.handleInput} />
            </div>
        );
    }

    @bind
    private handleInput(command: string) {
        console.log(command);
    }

    // private clicked() {
    //     const socket = io('', { transports: ['websocket'] });
    //     socket.on('news', function (data: any) {
    //         console.log(data);
    //         socket.emit('my other event', { my: 'data' });
    //     });
    // }
}

declare var document: {
    username: string;
} & Document;

ReactDOM.render(React.createElement(Client, { username: document.username }), document.getElementById("container"));
