import React from "react";
import { TalkGlobal } from "../../server/messages/index";
import { User } from "../App";

export const GenericMessage: React.SFC<{}> = (props) => {
    return <div className="message generic">{props.children}</div>
}

export const ErrorMessage: React.SFC<{}> = (props) => {
    return <div className="message error">{props.children}</div>
}

export const GlobalChatMessage: React.SFC<TalkGlobal> = props => {
    const name = props.from == User.name ? "You chat: " : `${props.fromDisplay} chats: `;
    return (
        <div className="global-chat">
            <span className="identifier">{name}</span>
            {props.message}
        </div>
    );
}