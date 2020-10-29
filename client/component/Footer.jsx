
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import Icon from './Icon';
import { compose } from 'redux'
import { translate } from 'react-i18next'

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
class Footer extends Component {
  static propTypes = {
    coins: PropTypes.array.isRequired,
    txs: PropTypes.array.isRequired,
  };

  render() {
    const { t, i18n } = this.props;

    const handleLocaleChange = event => {
        i18n.changeLanguage(event.target.value );
    }
    const coin = this.props.coins && this.props.coins.length ? this.props.coins[0] : { status: 'offline', blocks: 0 };
    const blocks = this.props.txs && this.props.txs.length ? this.props.txs[0].blockHeight : coin.blocks;
    const statusColor = (coin.status && coin.status.toLowerCase() === 'online') ? 'green' : 'red';
    const selected = i18n.language;

    return (
      <div className="footer row">
        <div className='col-lg-3 col-md-6 col-sm-12 m-t-20'>
          <img className="footer__logo" src="/img/footerlogo.svg" />
        </div>
        <div className='col-lg-3 col-md-6 col-sm-12 m-t-20'>
        <span className="footer__legal">
            <div>Copyright &copy; 2020 <a href="https://wagerr.com/">Wagerr</a></div>
            <div>Site design &copy; 2018 <a href="https://bulwarkcrypto.com/">Bulwark Cryptocurrency</a></div>
            <div>Logo &copy; 2018 <a href="https://wagerr.com/">Wagerr</a></div>
          </span>
        </div>
        <div className='col-lg-3 col-md-6 col-sm-12 m-t-20'>
        <div className="footer__data-wrapper">
            <div className="footer__data-block">
              <p className="footer__data-title">Locale</p>
              <p>
                <select className="footer__locale-select"  value={selected} onChange={event => handleLocaleChange(event)}>
                  <option value={'en'} data-content='English'>English</option>
                  <option value={'zh'} data-content='Chinese'>Chinese</option>
                  <option value={'kr'} data-content='Korean'>Korean</option>
                </select>
              </p>
            </div>
            <div className="footer__data-block">
              <p className="footer__data-title">Status</p>
              <p>
                <span className={ `u__dot u--text-${ statusColor }` }>&bull;</span>
                <span>{ coin.status }</span>
              </p>
            </div>
            <div className="footer__data-block">
              <p className="footer__data-title">Blocks</p>
              <p><b>{ blocks }</b></p>
            </div>
            <div className="footer__data-block">
              <p className="footer__data-title">Time</p>
              <p>{ `${ moment().utc().format('HH:mm') }  UTC`}</p>
            </div>
          </div>
        </div>
        <div className='col-lg-3 col-md-6 col-sm-12 m-t-20'>
        <div className="footer__social-media-wrapper">
            <div className="footer__social-title">Social Media</div>
            <div style={{ marginLeft: -6}}>
              <a href="https://bitcointalk.org/index.php?topic=1911583.0" target="_blank">
                <Icon name="bitcoin" className="fab footer__social-media-icon" />
              </a>
              <a href="https://discord.gg/vvvvDbv" target="_blank">
                <Icon name="discord" className="fab footer__social-media-icon" />
              </a>
              <a href="https://t.me/wagerrcoin" target="_blank">
                <Icon name="telegram" className="fab footer__social-media-icon" />
              </a>
              <a href="https://www.reddit.com/r/Wagerr/" target="_blank">
                <Icon name="reddit" className="fab footer__social-media-icon" />
              </a>
              <a href="https://github.com/wagerr" target="_blank">
                <Icon name="github" className="fab footer__social-media-icon" />
              </a>
              <a href="https://twitter.com/wagerrx" target="_blank">
                <Icon name="twitter" className="fab footer__social-media-icon" />
              </a>
              <a href="https://www.facebook.com/wagerr/" target="_blank">
                <Icon name="facebook" className="fab footer__social-media-icon" />
              </a>
            </div>
          </div>        
        </div>
      </div>
    );
  };
};

const mapState = state => ({
  coins: state.coins,
  txs: state.txs,
});

export default compose(
  translate('footer'),
  connect(mapState)
)(Footer);
