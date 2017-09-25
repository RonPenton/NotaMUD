import { CommandReference } from '../../../server/commands/index';
import { L } from '../../../server/utils/linq';
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

const Command: React.SFC<{ command: CommandReference }> = props => {
    const keywords = L(props.command.keywords).select(x => <span>{x}</span>).join(() => ", ");
    return (
        <div className="command">
            <div className="keywords">{keywords}</div>
            <div className="helptext">{props.command.helptext}</div>
        </div>
    )
}

export class Help extends OneTimeRender<Messages.Help> {
    render() {

        const commands = L(this.props.commands)
            .where(x => L(x.keywords).areAny(x => x.length > 0))
            .select(x => { return { keywords: L(x.keywords).orderByDescending(k => k.length).toArray(), helptext: x.helptext }; })
            .orderBy(x => x.keywords[0])
            .toArray();

        return (
            <div className="help">
                <hr className="divider" />
                <div>Commands:</div>
                {commands.map(x => <Command command={x} />)}
                <hr className="divider" />
            </div>
        );
    }
}
