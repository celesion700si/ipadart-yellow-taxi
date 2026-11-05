import {batchSegments} from './batch-segments.js';
import {batch2Segments} from './batch2-segments.js';
import {batch3Segments} from './batch3-segments.js';
// Coordinates are local to the object's parent; rotations are XYZ Euler radians.
const pose=(position,rotation=[0,0,0])=>({position,rotation});
const connectorTransforms=Object.fromEntries([-1,1].flatMap((side,i)=>[-3.2,3.2].map((z,j)=>[
  `connector-${i*2+j}`,{before:pose([side*3.5,0.87,z]),after:pose([side*1.64,0.87,z])}
])));
const plateTransforms=Object.fromEntries([['plate-brown-front',2.8],['plate-white-center',0],['plate-brown-rear',-2.8]].map(([id,z])=>[
  id,{before:pose([0,3,z]),after:pose([0,0.46,z])}
]));
const rearPose=(ready,built)=>({'parts-ready':pose(ready),'subassembly-built':pose(built),attached:pose(built)});
const rearTransforms={
  'rear-bar':rearPose([0,0,0],[0,0,0]),
  'rear-white':rearPose([0,0.9,0],[0,0.24,0]),
  'rear-subassembly-group':{'parts-ready':pose([0,2.9,-3.4]),'subassembly-built':pose([0,2.9,-3.4]),attached:pose([0,1.52,-4.4])},
  ...Object.fromEntries([-1,1].flatMap(side=>{
    const name=side===-1?'left':'right';
    return [[`rear-ramp-${name}`,rearPose([side*0.85,1.9,0.55],[side*0.4,0.36,0])],
      [`rear-yellow-${name}`,rearPose([side*2.7,1.05,0],[side*1.6,0.12,0])]];
  }))
};
// Source page numbers are references only; navigation uses segment + before/after.
const reference = page => ({ page, src: `public/instructions/page-${String(page).padStart(3, '0')}.png` });
export const assemblySegments = [
  {
    actionType:'insert', insertionAxis:'x', transforms:connectorTransforms,
    guides:[{id:'connector-guides',states:['before']}],
    id: 'axle-connectors', title: 'Axle Connectors', sourcePages: [10, 11],
    parts: ['connector-0','connector-1','connector-2','connector-3'],
    states: ['before','after'], initialState: 'before', targetState: 'after', completionState: 'after',
    edition: '01 / 底盤連接',
    stateLabels: {before:'準備組裝',after:'安裝完成'},
    cameraFraming: null,
    animationStages: [{id:'insert',kind:'insert',from:'before',to:'after',duration:1500,easing:'smoothstep',tracks:['connector-0','connector-1','connector-2','connector-3']}],
    headings: { before: '準備四個連接零件', after: '將四個連接零件插入底盤' },
    narration: { before: '先準備四個連接零件，確認它們的位置與方向。', after: '將四個連接零件對準底盤兩側，沿著孔位推入到底。' },
    subtitle: { before: '先準備四個連接零件，確認它們的位置與方向。', after: '將四個連接零件對準底盤兩側，沿著孔位推入到底。' },
    thumbnail: { before: reference(10), after: reference(11) },
    partsLabel: '4 × 連接零件'
  },
  {
    actionType:'place', placementDirection:[0,-1,0], transforms:plateTransforms,
    guides:[{id:'plate-guides',states:['before']}],
    id: 'interior-plates', title: 'Interior Plates', sourcePages: [12, 13],
    parts: ['plate-brown-front','plate-white-center','plate-brown-rear'],
    states: ['before','after'], initialState: 'before', targetState: 'after', completionState: 'after',
    edition: '02 / 底板安裝',
    stateLabels: {before:'準備組裝',after:'安裝完成'},
    cameraFraming: null,
    animationStages: [{id:'lower-plates',kind:'place',from:'before',to:'after',duration:1500,easing:'smoothstep',tracks:['plate-brown-front','plate-white-center','plate-brown-rear']}],
    headings: { before: '準備三個底板零件', after: '將三個底板放入底盤中央' },
    narration: { before: '接著準備三個底板零件，兩個棕色，一個白色。', after: '將三個底板對準位置，放入車體底盤中央。' },
    subtitle: { before: '接著準備三個底板零件，兩個棕色，一個白色。', after: '將三個底板對準位置，放入車體底盤中央。' },
    thumbnail: { before: reference(12), after: reference(13) },
    partsLabel: '2 × 棕色底板 · 1 × 白色底板'
  },
  {
    actionType:'build-and-attach', transforms:rearTransforms, guides:[],
    id:'rear-subassembly',title:'Rear Subassembly',sourcePages:[14,15,16,17],
    parts:['rear-bar','rear-white','rear-ramp-left','rear-ramp-right','rear-yellow-left','rear-yellow-right'],
    groupId:'rear-subassembly-group',
    states:['parts-ready','subassembly-built','attached'],
    initialState:'parts-ready',targetState:'attached',completionState:'attached',
    edition:'03 / 後方模組',partsLabel:'6 × 零件 · 先組小模組，再整組安裝',
    stateLabels:{'parts-ready':'準備零件','subassembly-built':'小模組完成','attached':'安裝完成'},
    cameraFraming:{target:[0,1.2,-0.5],position:[12,13,18]},
    animationStages:[
      {id:'build-subassembly',kind:'build',from:'parts-ready',to:'subassembly-built',duration:1800,easing:'smoothstep',
       tracks:['rear-white','rear-ramp-left','rear-ramp-right','rear-yellow-left','rear-yellow-right'],
       windows:{'rear-white':[0,0.3],'rear-ramp-left':[0.3,0.65],'rear-ramp-right':[0.3,0.65],'rear-yellow-left':[0.65,1],'rear-yellow-right':[0.65,1]},
       thumbnail:reference(15)},
      {id:'attach-subassembly',kind:'attach',from:'subassembly-built',to:'attached',duration:1600,easing:'smoothstep',tracks:['rear-subassembly-group']}
    ],
    headings:{'parts-ready':'準備後方小模組的零件','subassembly-built':'組合後方小模組','attached':'將整組模組安裝到底盤後方'},
    narration:{'parts-ready':'先準備這一組零件，我們要先組出一個後方小模組。','subassembly-built':'把零件依照方向組合，完成後方的小型結構。','attached':'將完成的小模組對準底盤後方，整組安裝到定位。'},
    subtitle:{'parts-ready':'先準備這一組零件，我們要先組出一個後方小模組。','subassembly-built':'把零件依照方向組合，完成後方的小型結構。','attached':'將完成的小模組對準底盤後方，整組安裝到定位。'},
    thumbnail:{'parts-ready':reference(14),'subassembly-built':reference(16),'attached':reference(17)}
  },
  {
    id:'rear-top-caps',title:'Rear Top Plate and End Caps',sourcePages:[18,19],
    actionType:'place',placementDirection:[0,-1,0],guides:[],
    parts:['rear-cap-bar','rear-cap-left','rear-cap-right'],
    states:['before','after'],initialState:'before',completionState:'after',
    transforms:{
      'rear-cap-bar':{before:pose([0,4.1,-4.4]),after:pose([0,2.96,-4.4])},
      'rear-cap-left':{before:pose([-2,4.7,-4.4]),after:pose([-2,2.96,-4.4])},
      'rear-cap-right':{before:pose([2,4.7,-4.4]),after:pose([2,2.96,-4.4])}
    },
    animationStages:[{id:'place-rear-caps',kind:'place',from:'before',to:'after',duration:1800,easing:'smoothstep',
      tracks:['rear-cap-bar','rear-cap-left','rear-cap-right'],
      windows:{'rear-cap-bar':[0,0.5],'rear-cap-left':[0.5,1],'rear-cap-right':[0.5,1]}}],
    edition:'04 / 後方頂板',partsLabel:'1 × 黃色長板 · 2 × 圓角端片',
    stateLabels:{before:'準備組裝',after:'安裝完成'},
    headings:{before:'準備黃色長板與兩個端片',after:'將長板與端片裝到後方結構'},
    narration:{before:'準備一個黃色長板和兩個圓角端片，確認兩端的方向。',after:'先將長板放到後方結構上，再將兩個端片向下壓入定位。'},
    subtitle:{before:'準備一個黃色長板和兩個圓角端片，確認兩端的方向。',after:'先將長板放到後方結構上，再將兩個端片向下壓入定位。'},
    thumbnail:{before:reference(18),after:reference(19)},
    cameraFraming:{target:[0,1.2,-0.5],position:[12,13,18]}
  },
  {
    id:'rear-upright-panel',title:'Rear Upright Panel',sourcePages:[20,21],
    actionType:'place',placementDirection:[0,-1,0],guides:[],parts:['rear-gray-panel'],
    states:['before','after'],initialState:'before',completionState:'after',
    transforms:{'rear-gray-panel':{before:pose([0,4,-2.56]),after:pose([0,1.66,-2.56])}},
    animationStages:[{id:'place-upright-panel',kind:'place',from:'before',to:'after',duration:1500,easing:'smoothstep',tracks:['rear-gray-panel']}],
    edition:'05 / 灰色直立板',partsLabel:'1 × 灰色直立板件',
    stateLabels:{before:'準備組裝',after:'安裝完成'},
    headings:{before:'準備灰色直立板件',after:'將灰色板件裝到後方底板'},
    narration:{before:'準備灰色直立板件，將平整的一面朝向車體中央。',after:'對準後方棕色底板，將灰色板件向下壓入定位。'},
    subtitle:{before:'準備灰色直立板件，將平整的一面朝向車體中央。',after:'對準後方棕色底板，將灰色板件向下壓入定位。'},
    thumbnail:{before:reference(20),after:reference(21)},
    cameraFraming:{target:[0,1.2,-0.5],position:[12,13,18]}
  }
  ,...batchSegments,...batch2Segments,...batch3Segments
];
export const plateDefinitions = [
  { id:'plate-brown-front', columns:3, color:0xad7549, z:2.8 },
  { id:'plate-white-center', columns:2, color:0xf4f1e8, z:0 },
  { id:'plate-brown-rear', columns:3, color:0xad7549, z:-2.8 }
];
