import React from "react";

import { User } from "../../App";
import { TalkGlobal, TalkPrivate, TalkRoom, TimeStamped } from '../../../server/messages/index';
import { TimeStamp } from "./simple";


export const Global: React.SFC<TimeStamped<TalkGlobal>> = props => {
    const name = props.uniquename == User.uniquename ? "You chat: " : `${props.name} chats: `;
    return (
        <div className="chat-global">
            <TimeStamp time={props.timeStampStr} />
            <span className="identifier">{name}</span>
            {props.message}
        </div>
    );
}

export const Room: React.SFC<TimeStamped<TalkRoom>> = props => {
    const message = props.actorid == User.id 
            ? `You say "${props.message}"`
            : `${props.actorname} says "${props.message}"`;
    return (
        <div className="chat-global">
            <TimeStamp time={props.timeStampStr} />
            {message}
        </div>
    );
}

export const Private: React.SFC<TimeStamped<TalkPrivate>> = props => {
    return (
        <div className="chat-private">
            <TimeStamp time={props.timeStampStr} />
            {`${props.name} whispers to you, "${props.message}"`}
        </div>
    );
}
