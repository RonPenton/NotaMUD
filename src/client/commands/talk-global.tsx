import { GameContext, User } from '../App';
import React from 'react';
import { create, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('talk-global',
    (message: Messages.TimeStamped<Messages.TalkGlobal>, context: GameContext) => {
        context.addOutput(<Global {...message} />);
    });

export const Global: React.SFC<Messages.TimeStamped<Messages.TalkGlobal>> = props => {
    const name = props.from.uniquename == User.uniquename ? "You chat: " : `${props.from.name} chats: `;
    return (
        <div className="talk-global">
            <TimeStamp time={props.timeStampStr} />
            <span className="identifier">{name}</span>
            {props.message}
        </div>
    );
}

