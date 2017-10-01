import { Debug } from './debug';
import moment from 'moment';
import { OneTimeRender } from '../components/OneTimeRender';
import { GameContext } from '../App';
import React from 'react';
import { create } from './index';
import * as Messages from '../../server/messages';

export const command = create('pong',
    (message: Messages.TimeStamped<Messages.Pong>, context: GameContext) => {
        context.addOutput(<Pong stamp={message.originalStamp} />);
    });

export class Pong extends OneTimeRender<{ stamp: string }> {
    render() {
        const now = moment();
        const then = moment(this.props.stamp);
        const diff = moment.duration(now.diff(then));
        return <Debug>{`[Server Latency: ${diff.asMilliseconds()}ms]`}</Debug>
    }
}
