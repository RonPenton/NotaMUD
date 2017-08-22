import React from 'react'
import * as ReactDOM from 'react-dom'
import io from 'socket.io-client';

export class App extends React.Component {
    render() {

        return (
            <div>
                <button onClick={() => this.clicked()}>boop</button>
            </div>
        );
    }

    private clicked() {
        var socket = io('', { transports: ['websocket'] });
        socket.on('news', function (data: any) {
            console.log(data);
            socket.emit('my other event', { my: 'data' });
        });
    }
}

ReactDOM.render(React.createElement(App), document.getElementById("main"));
