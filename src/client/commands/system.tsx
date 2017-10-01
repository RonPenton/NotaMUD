import { GameContext } from '../App';
import React from 'react';
import { create, ShowTimestamp, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('system',
    (message: Messages.TimeStamped<Messages.System>, context: GameContext) => {
        context.addOutput(<System time={message.timeStampStr}>{message.message}</System>)
    });

export const System: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message system"><TimeStamp time={props.time} />{props.children}</div>
}