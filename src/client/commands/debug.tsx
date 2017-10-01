import { GameContext } from '../App';
import React from 'react';
import { create, ShowTimestamp, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('debug',
    (message: Messages.TimeStamped<Messages.Debug>, context: GameContext) => {
        context.addOutput(<Debug time={message.timeStampStr}>{message.message}</Debug>)
    });

export const Debug: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message debug"><TimeStamp time={props.time} />{props.children}</div>
}
