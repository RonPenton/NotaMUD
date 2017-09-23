import { DirectionNames, Direction } from '../../server/models/room';
import React from "react";
import * as moment from 'moment';

import { TalkGlobal, TimeStamped, RoomDescription } from '../../server/messages/index';
import { User } from "../App";
import OneTimeRender from "../components/OneTimeRender";

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

export class PongMessage extends OneTimeRender<{ stamp: string }> {
    render() {
        const now = moment();
        const then = moment(this.props.stamp);
        const diff = moment.duration(now.diff(then));
        return <DebugMessage>{`[Server Latency: ${diff.asMilliseconds()}ms]`}</DebugMessage>
    }
}

export const GlobalChatMessage: React.SFC<TimeStamped<TalkGlobal>> = props => {
    const name = props.uniquename == User.uniquename ? "You chat: " : `${props.name} chats: `;
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

export class RoomDescriptionMessage extends OneTimeRender<TimeStamped<RoomDescription>> {
    render() {
        return (
            <div className="room">
                <div>&nbsp;</div>
                <div className="name">{this.props.name}</div>
                {this.description()}
                {this.exits()}
            </div>
        );
    }

    description() {
        if (this.description)
            return <div className="description">{this.props.description}</div>
        return null;
    }

    exits() {
        const directionKeys = Object.getOwnPropertyNames(this.props.exits) as Direction[];
        const directions = directionKeys.map(x => DirectionNames.get(x));
        return <div className="exits"><span className="exit-text">Exits: </span>{directions.join(", ")}</div>
    }
}
