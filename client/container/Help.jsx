
import Component from '../core/Component';
import React from 'react';

export default class Help extends Component {
  state = {
    action: -1
  }
  render() {
    const { action } = this.state;
    return (
      <div className='help'>
        <div className='container animated fadeInUp'>
          <h2 >How to bet here</h2>
          <div className='row'>

            <div className='help__item col-lg-3 col-sm-6 col-xs-6'>
              <img src={'/img/uiupdate/help_icon_1.png'} alt={'help_icon_1'} />
              <div className='help__item__title'>A computer</div>
              <div className='help__item__description'>You'll need a computer to set up your digital wallet and buy, sell, trade crpto assets with.</div>
            </div>
            <div className='help__item col-lg-3 col-sm-6 col-xs-6'>
              <img src={'/img/uiupdate/help_icon_2.png'} alt={'help_icon_1'} />
              <div className='help__item__title'>Chrome or Firefox</div>
              <div className='help__item__description'>You'll need to use Chrome or Firefox as your internet browser to enable Wagerr Extension Wallet</div>
              <div className='help__item__note'>Download Chrome <span>or</span> Firefox</div>
            </div>
            <div className='help__item col-lg-3 col-sm-6 col-xs-6'>
              <img src={'/img/uiupdate/help_icon_3.png'} alt={'help_icon_1'} />
              <div className='help__item__title'>Wagerr Extension Wallet</div>
              <div className='help__item__description'>The wagerr Extension wallet Browser Extension turns your browser into a secure Wagerr Wallet</div>
              <div className='help__item__note'>Wagerr Extension Wallet</div>
            </div>
            
          </div>

          <div className='help__step'>
            <div className='help__step__title'>Step by Step</div>
            {
              STEPS.map((item, index) =>
                <div
                  key={index}
                  onClick={() => this.setState({ action: index })}
                  className='help__step__item'
                >
                  <div>
                    <span className='help__step__item__title'>{item.id + 1}</span>
                    <span className='help__step__item__desc'>{item.title}</span> <br />
                    {
                      item.id === action &&
                      <div>
                        <span className='help__step__item__note'>{item.description}</span>
                        <ul>
                          <li>Chrome</li>
                          <li>Firefox</li>
                        </ul>
                      </div>
                    }
                  </div>
                </div>)}
          </div>

          <div className='card card__help row'>
            <div className='col-lg-9 col-md-12'>
              <div className='card__help__title'>QUESTIONS?</div>
              <div className='card__help__note'>We're always happy to help with code or other questions you might have! Contact us via <span>support@wagerrexplorer.info</span> or chat with us and other developers in <span>bet here</span> on the #developers channel.</div>
            </div>
            <div className='col-lg-3 col-md-12'>
              <div className='card__help__button'>
                {'EMAIL US'}
                <img src={'/img/uiupdate/right.png'} alt={'right'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

const STEPS = [
  { id: 0, title: 'Download Chrome or Firefox', description: 'With your computer/laptop, install Chrome or Firefox as your internet browser.', content: ['Chrome', 'Firefox'] },
  { id: 1, title: 'Install Wagerr Extension Wallet', description: 'With your computer/laptop, install Chrome or Firefox as your internet browser.', content: ['Chrome', 'Firefox'] },
  { id: 2, title: 'Send WGR to your extension wallet', description: 'With your computer/laptop, install Chrome or Firefox as your internet browser.', content: ['Chrome', 'Firefox'] },
  { id: 3, title: 'Make a bet or play game here', description: 'With your computer/laptop, install Chrome or Firefox as your internet browser.', content: ['Chrome', 'Firefox'] }
]