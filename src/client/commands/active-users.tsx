import { OneTimeRender } from '../components/OneTimeRender';
import { GameContext } from '../App';
import React from 'react';
import { create } from './index';
import * as Messages from '../../server/messages';

export const command = create('active-users',
    (message: Messages.ActiveUsers, context: GameContext) => {
        context.addOutput(<ActiveUsers {...message} />);
    });

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
