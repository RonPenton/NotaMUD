import React from 'react';

export class OneTimeRender<T> extends React.Component<T> {
    shouldComponentUpdate() { return false; }
}

export default OneTimeRender;