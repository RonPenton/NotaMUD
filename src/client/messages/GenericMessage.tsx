import React from "react";

export const GenericMessage: React.SFC<{}> = (props) => {
    return <div className="message generic">{props.children}</div>
}
