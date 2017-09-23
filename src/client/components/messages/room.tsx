import React from "react";

import OneTimeRender from "../OneTimeRender";
import { TimeStamped, RoomDescription } from '../../../server/messages/index';
import { DirectionNames, Direction } from '../../../server/models/room';


export class Description extends OneTimeRender<TimeStamped<RoomDescription>> {
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
