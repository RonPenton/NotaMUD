import React from "react";
import * as moment from 'moment';


export type ShowTimestamp = { time?: string };
export const TimeStamp: React.SFC<ShowTimestamp> = props => {
    if (!props.time)
        return null;
    const time = moment(props.time);
    return <span className="timestamp">{`[${time.format('LT')}] `}</span>
}

export const Generic: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message generic"><TimeStamp time={props.time} />{props.children}</div>
}

export const Error: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message error"><TimeStamp time={props.time} />{props.children}</div>
}

export const UserInput: React.SFC<{ text: string }> = props => {
    return <div className="user-input">{`${props.text}`}</div>;
}

