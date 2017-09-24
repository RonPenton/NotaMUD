import React from "react";

import OneTimeRender from "../OneTimeRender";
import * as Messages from '../../../server/messages';

export class ActiveUsers extends OneTimeRender<Messages.ActiveUsers> {
    render() {
        return (
            <div className="active-users">
                <hr className="divider" />
                <div>List of adventurers:</div>
                <ul>
                    {this.props.list.map(x => <li>{x.name}</li>)}
                </ul>
                <hr className="divider" />
            </div>
        );
    }
}
