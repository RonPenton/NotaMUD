import { L } from '../../../server/utils/linq';
import { ActorReference } from '../../../server/models/user';
import React from "react";

import OneTimeRender from "../OneTimeRender";
import { ActorMoved, RoomDescription, TimeStamped } from '../../../server/messages/index';
import { Direction, getDirectionOpposite, getEnteringPhrase, getLeavingPhrase, DirectionNames } from '../../../server/models/direction';
import { User } from '../../App';


export class Description extends OneTimeRender<TimeStamped<RoomDescription>> {
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

export class Movement extends OneTimeRender<TimeStamped<ActorMoved>> {
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
