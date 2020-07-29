import { Direction, DirectionNames } from '../../server/models/direction';
import { ActorReference } from '../../server/models/user';
import { L } from '../../server/utils/linq';
import { OneTimeRender } from '../components/OneTimeRender';
import { GameContext, User } from '../App';
import React from 'react';
import { create } from './index';
import * as Messages from '../../server/messages';


export const command = create('room-description',
    (message: Messages.TimeStamped<Messages.RoomDescription>, context: GameContext) => {
        context.addOutput(<Description {...message} />);
        context.addRoomInformation(message);
    });

export class Description extends OneTimeRender<Messages.RoomDescription> {
    render() {
        return (
            <div className="room">
                <div>&nbsp;</div>
                <div className="name">{this.props.name}</div>
                {this.description()}
                {this.actors()}
                {this.exits()}
            </div>
        );
    }

    actors() {
        const displayActors = L(this.props.actors).where(x => x.id != User.id);
        if (!displayActors.areAny())
            return null;
        return (
            <div className="actors">
                <span className="actors-text">Here: </span>
                {displayActors.select(x => this.actor(x)).join(() => ", ")}
            </div>
        );
    }

    actor(actor: ActorReference) {
        return <span className="actor">{actor.name}</span>;
    }

    description() {
        if (this.props.description)
            return <div className="description">{this.props.description}</div>
        return null;
    }

    exits() {
        const directionKeys = Object.getOwnPropertyNames(this.props.exits) as Direction[];
        const directions = directionKeys.map(x => DirectionNames.get(x));
        return <div className="exits"><span className="exit-text">Exits: </span>{directions.join(", ")}</div>
    }
}
