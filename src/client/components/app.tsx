import React from 'react';
import { TopBar, TopBarLeft, TopBarMenu, TopBarMenuItem } from '../foundation/top-bar';
import { config } from '../../server/config';

export const App: React.SFC<{}> = () => {
    return (
        <TopBar>
            <TopBarLeft>
                <TopBarMenu>
                    <TopBarMenuItem href="/">{config.Name}</TopBarMenuItem>
                    <TopBarMenuItem href="/game">{config.Name}</TopBarMenuItem>
                    <TopBarMenuItem href="/logout">{config.Name}</TopBarMenuItem>
                </TopBarMenu>
            </TopBarLeft>
        </TopBar>



    );
}