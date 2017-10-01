import { GameContext } from '../App';
import React from 'react';
import { create, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('talk-room',
    (message: Messages.TimeStamped<Messages.TalkPrivate>, context: GameContext) => {
        context.addOutput(<Private {...message} />);
    });

export const Private: React.SFC<Messages.TimeStamped<Messages.TalkPrivate>> = props => {
    return (
        <div className="talk-private">
            <TimeStamp time={props.timeStampStr} />
            {`${props.from.name} whispers to you, "${props.message}"`}
        </div>
    );
}
