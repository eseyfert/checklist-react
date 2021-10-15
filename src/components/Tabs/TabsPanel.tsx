import React from 'react';

interface PanelProps {
    id: number;
    selected?: Boolean;
}

/**
 * TabsPanel
 *
 * Panel div element to be used inside the Tabs component.
 *
 * @export
 * @class TabsPanel
 * @extends {React.Component<PanelProps>}
 * @version 1.0.0
 */
export default class TabsPanel extends React.Component<PanelProps> {
    render() {
        const { id, selected } = this.props;

        return (
            <div
                id={`panel-${id}`}
                className={`mdf-tabs__panel ${selected ? 'mdf-tabs__panel--active' : ''}`}
                role="tabpanel"
                tabIndex={0}
            >
                {this.props.children}
            </div>
        );
    }
}
