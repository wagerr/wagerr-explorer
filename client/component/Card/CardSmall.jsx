
// import Component from '../../core/Component';
// import React from 'react';
// import Card from './Card';

// export default class CardSmall extends Component {
//   render() {
//     const { title, title2, style, data } = this.props;
//     return (
//       <div className="animated fadeInUp">
//         <Card
//           title={title}
//           title2={title2}
//           className="card--status"
//           pstyle={style}
//         >
//           {data && data.map((item, index) =>
//             <div key={index} className={`card__row ${index % 2 === 0 && 'bg-eee'}`}>
//               <span className="card__label" style={{whiteSpace: 'nowrap'}}>{item.title}</span>
//               <span className="card__result" style={{whiteSpace: 'nowrap'}}>{item.value}</span>
//             </div>)}

//         </Card>
//       </div>
//     );
//   };
// }
