import Component from '../../core/Component'
import React from 'react'

import Switch from "react-switch";

export default class GlobalSwitch extends Component {
    state = {
        hidden: true
    }
    render() {
        const {
            toggleSwitch,
            handleToggleChange,
            toggleSwitchOddsStyle,
            handleToggleChangeOddsStyle,
            toggleSwitchOdds,
            handleToggleChangeOdds,
        } = this.props;
        const { hidden } = this.state;
        return (
            <div className={`global-switch ${hidden ? 'hidden' : 'shown'}`}>
                <div className='global-switch__full'>
                    <div className='global-switch__note' onClick={() => this.setState({ hidden: !hidden })}>
                        <span>⚙️</span>
                    </div>
                    <div className='global-switch__body'>
                        <div className='global-switch__body__item'>
                            <label htmlFor="material-switch">
                                <Switch
                                    checked={toggleSwitch}
                                    onChange={handleToggleChange}
                                    onColor="#86d3ff"
                                    onHandleColor="#2693e6"
                                    handleDiameter={18}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                    height={15}
                                    width={30}
                                    className="react-switch"
                                    id="material-switch"
                                />
                            </label>
                            <div className='global-switch__body__label'>
                                <div className={!toggleSwitch ? 'global-switch__body__label__active' : ''} onClick={() => handleToggleChange(true)}>
                                    Completed
                                </div>
                                &nbsp;|&nbsp;
                                <div className={toggleSwitch ? 'global-switch__body__label__active' : ''} onClick={() => handleToggleChange(false)}>
                                    Opened
                                </div>
                            </div>
                        </div>
                        <div className='global-switch__body__item'>
                            <label htmlFor="material-switch1">
                                <Switch
                                    checked={toggleSwitchOddsStyle}
                                    onChange={handleToggleChangeOddsStyle}
                                    onColor="#86d3ff"
                                    onHandleColor="#2693e6"
                                    handleDiameter={18}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                    height={15}
                                    width={30}
                                    className="react-switch"
                                    id="material-switch"
                                />
                            </label>
                            <div className='global-switch__body__label'>
                                <div className={!toggleSwitchOddsStyle ? 'global-switch__body__label__active' : ''} onClick={() => handleToggleChangeOddsStyle(true)}>
                                    Decimal Odds
                                </div>
                                &nbsp;|&nbsp;
                                <div className={toggleSwitchOddsStyle ? 'global-switch__body__label__active' : ''} onClick={() => handleToggleChangeOddsStyle(false)}>
                                    American Odds
                                </div>
                            </div>
                        </div>
                        <div className='global-switch__body__item'>
                            <label htmlFor="material-switch2">
                                <Switch
                                    checked={toggleSwitchOdds}
                                    onChange={handleToggleChangeOdds}
                                    onColor="#86d3ff"
                                    onHandleColor="#2693e6"
                                    handleDiameter={18}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                    height={15}
                                    width={30}
                                    className="react-switch"
                                    id="material-switch"
                                />
                            </label>
                            <div className='global-switch__body__label'>
                                <div className={!toggleSwitchOdds ? 'global-switch__body__label__active' : ''} onClick={() => handleToggleChangeOdds(true)}>
                                    On Chain Odds
                                </div>
                                &nbsp;|&nbsp;
                                <div className={toggleSwitchOdds ? 'global-switch__body__label__active' : ''} onClick={() => handleToggleChangeOdds(false)}>
                                    Effective Odds
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );

    };
}
