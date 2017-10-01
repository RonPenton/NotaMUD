import { GameContext } from '../App';
import React from 'react';
import { create, ShowTimestamp, TimeStamp } from './index';
import * as Messages from '../../server/messages';

export const command = create('error',
    (message: Messages.TimeStamped<Messages.Error>, context: GameContext) => {
        context.addOutput(<ErrorComponent time={message.timeStampStr}>{message.message}</ErrorComponent>)
    });



export const ErrorComponent: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message error"><TimeStamp time={props.time} />{props.children}</div>
}
