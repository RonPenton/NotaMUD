import React from "react";
import * as moment from 'moment';

import { TalkGlobal, TimeStamped } from '../../server/messages/index';
import { User } from "../App";

export type ShowTimestamp = { time?: string };
export const TimeStamp: React.SFC<ShowTimestamp> = props => {
    if (!props.time)
        return null;
    const time = moment(props.time);
    return <span className="timestamp">{`[${time.format('LT')}] `}</span>
}

export const GenericMessage: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message generic"><TimeStamp time={props.time} />{props.children}</div>
}

export const ErrorMessage: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message error"><TimeStamp time={props.time} />{props.children}</div>
}

export const GlobalChatMessage: React.SFC<TimeStamped<TalkGlobal>> = props => {
    const name = props.from == User.name ? "You chat: " : `${props.fromDisplay} chats: `;
    return (
        <div className="global-chat">
            <TimeStamp time={props.timeStampStr} />
            <span className="identifier">{name}</span>
            {props.message}
        </div>
    );
}

export interface UserInputProps {
    text: string;
}
export const UserInput: React.SFC<UserInputProps> = props => {
    return <div className="user-input">{`${props.text}`}</div>;
}