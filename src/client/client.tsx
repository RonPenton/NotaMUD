import React from 'react'
import * as ReactDOM from 'react-dom';
import io from 'socket.io-client';
import { Button, LinkButton } from './foundation/button';
import { Presets, SvgLoader } from './components/Svg';


export class App extends React.Component {
    render() {

        return (
            <div>
                <Button onClick={() => this.clicked()}>boop</Button>
                <LinkButton href="/game">zoop</LinkButton>
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Default} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Fire} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Ice} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Forest} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Sun} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Poison} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Gold} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Air} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Holy} />
                <SvgLoader url="./icons/battle-axe.svg" size={80} {...Presets.Crimson} />
            </div>
        );
    }

    private clicked() {
        const socket = io('', { transports: ['websocket'] });
        socket.on('news', function (data: any) {
            console.log(data);
            socket.emit('my other event', { my: 'data' });
        });
    }
}

ReactDOM.render(React.createElement(App), document.getElementById("main"));
