import { CommandReference } from '../../server/commands/index';
import { L } from '../../server/utils/linq';
import { OneTimeRender } from '../components/OneTimeRender';
import { GameContext } from '../App';
import React from 'react';
import { create } from './index';
import * as Messages from '../../server/messages';

export const command = create('help',
    (message: Messages.Help, context: GameContext) => {
        context.addOutput(<Help {...message} />);
    });

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

const Command: React.SFC<{ command: CommandReference }> = props => {
    const keywords = L(props.command.keywords).select(x => <span>{x}</span>).join(() => ", ");
    return (
        <div className="command">
            <div className="keywords">{keywords}</div>
            <div className="helptext">{props.command.helptext}</div>
        </div>
    )
}
