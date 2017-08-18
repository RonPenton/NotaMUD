import React from 'react'
import * as ReactDOM from 'react-dom'

export const App: React.SFC = () => {
    return <span>Ello</span>;
}

ReactDOM.render(React.createElement(App), document.getElementById("main"));
