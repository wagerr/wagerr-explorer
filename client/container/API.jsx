
import Component from '../core/Component';
import React from 'react';

import APIdata from '../component/API/APIdata';
import APIsection from '../component/API/APIsection';
import HorizontalRule from '../component/HorizontalRule';
import ExplorerMenu from '../component/Menu/ExplorerMenu';
import CoinSummary from '../container/CoinSummary';
import SearchBar from '../component/SearchBar';
import SearchEventBar from '../component/SearchEventBar';
import Footer from '../component/Footer';
import ExplorerOverviewMenu from '../component/Menu/ExplorerOverviewMenu';
export default class API extends Component {

  getSections = () => {
    return APIdata.map((section, idx) => {
      return <APIsection
        key={ idx }
        heading={ section.heading }
        subHeading={ section.subHeading }
        calls={ section.calls } />
    });
  };

  render() {
    return (
      <div className="content content-top" id="body-content">
        <ExplorerMenu onSearch={ this.props.handleSearch } />        
        <div className="content__wrapper_total">    
        <ExplorerOverviewMenu  />      
        <SearchBar
      className="search--mobile mr-3"
      onSearch={ this.props.handleSearch }
      placeholder="Search Blockchain" /> 
          <div className="content_search_wrapper">                      
            <div className="content_page_title">
              <span>Movement</span>
            </div>              
          </div>
          <div className="content__wrapper">
            <CoinSummary
              onRemove={this.props.handleRemove}
              onSearch={this.props.handleSearch}
              searches={this.props.searches} />
            <div className="animated fadeIn">
              <br />
              <div className="api">
                <div className="api__documentation">
                  <HorizontalRule className="api__documentation-title" title="API Documentation" />
                  <div className="pr-4">
                    <p className="api__intro">
                    The block explorer provides an API allowing users and/or applications to retrieve information from the network without the need for a local wallet.
                    </p>
                    <div className="api__call-container">
                      { this.getSections() }
                    </div>
                  </div>
                </div>
                <div className="api__detail">
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    ); 
  };
}
