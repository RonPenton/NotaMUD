import { GameContext, User } from '../App';
import React from 'react';
import { create, ShowTimestamp, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('connected',
    (message: Messages.TimeStamped<Messages.Disconnected>, context: GameContext) => {
        if (message.from.uniquename == User.uniquename)
            return;
        else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
            context.addOutput(<Connected time={message.timeStampStr}>{`${message.from.name} has disconnected!`}</Connected>)
    });

export const Connected: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message connected"><TimeStamp time={props.time} />{props.children}</div>
}
