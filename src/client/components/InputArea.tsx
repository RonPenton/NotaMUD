import React from "react";
import { Key } from "ts-keycode-enum";
import { bind } from "decko";

export interface InputAreaProps {
    newInput: (value: string) => void;
}

export interface InputAreaState {
    history: string[];
    currentItem: number;
}

const MAX_HISTORY_SIZE = 11;

export class InputArea extends React.Component<InputAreaProps, InputAreaState> {
    public constructor(props: InputAreaProps) {
        super(props);
        this.state = { history: [""], currentItem: 0 };
    }

    public render() {
        return (
            <input
                type="text"
                className="input-area"
                onKeyUp={this.keyUp}
                onChange={this.change}
                value={this.state.history[this.state.currentItem]} />
        );
    }

    @bind
    private change(evt: React.ChangeEvent<HTMLInputElement>) {
        if (this.state.currentItem == 0) {
            // only change it if we're on the active line. 
            this.setState({ history: [evt.currentTarget.value].concat(this.state.history.slice(1)) })
        }
        else {
            // user mutating old history item. Push it to the top. 
            this.setState({ history: [evt.currentTarget.value].concat(this.state.history.slice(1)), currentItem: 0 });
        }
    }

    @bind
    private keyUp(evt: React.KeyboardEvent<HTMLInputElement>) {
        if (evt.keyCode == Key.Enter) {
            this.submitNewCommand(evt.currentTarget.value);
        }
        else if (evt.keyCode == Key.UpArrow && evt.ctrlKey) {
            this.navigateHistory(1);
            evt.stopPropagation();
        }
        else if (evt.keyCode == Key.DownArrow && evt.ctrlKey) {
            this.navigateHistory(-1);
            evt.stopPropagation();
        }
    }

    private submitNewCommand(command: string) {
        if (command == '.') {
            // repeat last command.
            if (this.state.history.length > 1) {
                this.submitNewCommand(command[1]);
            }
            return;
        }

        const history = this.state.currentItem == 0
            ? [""].concat(this.state.history).slice(0, MAX_HISTORY_SIZE)
            : ["", command].concat(this.state.history).slice(0, MAX_HISTORY_SIZE);

        this.setState({ currentItem: 0, history: history });
        this.props.newInput(command);
    }

    private navigateHistory(direction: 1 | -1) {
        if (this.state.currentItem == 0 && direction == -1)
            return;
        if (this.state.currentItem == this.state.history.length - 1 && direction == 1)
            return;
        this.setState({ currentItem: this.state.currentItem + direction });
    }
}
