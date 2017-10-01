import { getDirectionOpposite, getEnteringPhrase, getLeavingPhrase } from '../../server/models/direction';
import { OneTimeRender } from '../components/OneTimeRender';
import { GameContext, User } from '../App';
import React from 'react';
import { create } from './index';
import * as Messages from '../../server/messages';

export const command = create('actor-moved',
    (message: Messages.ActorMoved, context: GameContext) => {
        context.addOutput(<Movement {...message} />);
    });

export class Movement extends OneTimeRender<Messages.ActorMoved> {
    render() {
        if (this.props.from.id == User.id)
            return null;

        const phrase = this.props.direction
            ? this.props.entered
                ? ` enters ${getEnteringPhrase(getDirectionOpposite(this.props.direction))}`
                : ` leaves ${getLeavingPhrase(this.props.direction)}`
            : this.props.entered
                ? ' appears out of nowhere'
                : ' disappears into thin air'

        return (
            <div className="actor-moved">
                <span className="name">{this.props.from.name}</span>
                {phrase}
            </div>
        );
    }
}
