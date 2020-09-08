// import Component from '../../core/Component';
// import React from 'react';
//
// export default class CardLatestBlocks extends Component {
//     render() {
//         const {data} = this.props;
//         return (
//             <div className="animated fadeInUp w3-tables w3-responsive">
//                 <table className="w3-table-all">
//                     <tbody>
//                     <tr className="table-header">
//                         <th>HEIGHT</th>
//                         <th>TRANSACTION HASH</th>
//                         <th>VALUE</th>
//                         <th>AGE</th>
//                         <th className='mobile-recipents'></th>
//                         <th>CREATED</th>
//                     </tr>
//                     {
//                         data &&
//                         data.map((item, index) =>
//                             <tr key={index} className='table-item'>
//                                 <td>{item.blockHeight}</td>
//                                 <td className="cell-ellipsis">{item.txId}</td>
//                                 <td>{item.vout}</td>
//                                 <td style={{minWidth: 80}}>{item.age}</td>
//                                 <td>{item.recipients}</td>
//                                 <td style={{minWidth: 160}}>{item.createdAt}</td>
//                             </tr>)}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     };
// }
