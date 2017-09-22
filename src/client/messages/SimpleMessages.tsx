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

export const DebugMessage: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message debug"><TimeStamp time={props.time} />{props.children}</div>
}

export class PongMessage extends React.PureComponent<{ stamp: string }> {
    render() {
        const now = moment();
        const then = moment(this.props.stamp);
        const diff = moment.duration(now.diff(then));
        return <DebugMessage>{`[Server Latency: ${diff.asMilliseconds()}ms]`}</DebugMessage>
    }
}

export const GlobalChatMessage: React.SFC<TimeStamped<TalkGlobal>> = props => {
    const name = props.username == User.name ? "You chat: " : `${props.userDisplayname} chats: `;
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