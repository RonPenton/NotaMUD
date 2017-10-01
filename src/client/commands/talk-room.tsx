import { GameContext, User } from '../App';
import React from 'react';
import { create, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('talk-room',
    (message: Messages.TimeStamped<Messages.TalkRoom>, context: GameContext) => {
        context.addOutput(<Room {...message} />);
    });

export const Room: React.SFC<Messages.TimeStamped<Messages.TalkRoom>> = props => {
    const message = props.from.id == User.id
        ? `You say "${props.message}"`
        : `${props.from.name} says "${props.message}"`;
    return (
        <div className="talk-room">
            <TimeStamp time={props.timeStampStr} />
            {message}
        </div>
    );
}
