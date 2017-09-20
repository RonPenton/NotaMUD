import React from "react";

export interface AppProps {
    username: string;
}

export class GameHeader extends React.Component<AppProps> {
    public render() {
        return (
            <div className="top-bar">
                <div className="top-bar-left">
                    <ul className="menu">
                        <li><a href="/">Home</a></li>
                        <li><a href="/game">Game</a></li>
                        <li><a href="/profile">{this.props.username}</a></li>
                        <li>
                            <form action="/logout" method="POST">
                                <input type="submit" value="Logout" className="button small" />
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
