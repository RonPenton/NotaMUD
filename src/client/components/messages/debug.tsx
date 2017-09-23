import React from "react";
import * as moment from 'moment';

import OneTimeRender from "../OneTimeRender";
import { ShowTimestamp, TimeStamp } from "./simple";


export const Debug: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message debug"><TimeStamp time={props.time} />{props.children}</div>
}

export class Pong extends OneTimeRender<{ stamp: string }> {
    render() {
        const now = moment();
        const then = moment(this.props.stamp);
        const diff = moment.duration(now.diff(then));
        return <Debug>{`[Server Latency: ${diff.asMilliseconds()}ms]`}</Debug>
    }
}
