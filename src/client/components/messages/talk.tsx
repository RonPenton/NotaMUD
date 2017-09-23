import React from "react";

import { User } from "../../App";
import { TalkGlobal, TimeStamped, TalkRoom } from '../../../server/messages/index';
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
            : `${props.name} says "${props.message}"`;
    return (
        <div className="chat-global">
            <TimeStamp time={props.timeStampStr} />
            {message}
        </div>
    );
}
