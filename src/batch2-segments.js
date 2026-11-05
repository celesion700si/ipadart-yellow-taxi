// Page 38–53 additions. These are authored data using the existing PLACE contract.
const pose=position=>({position,rotation:[0,0,0]});
const reference=page=>({page,src:`public/instructions/page-${String(page).padStart(3,'0')}.png`});
function placement({id,title,pages,edition,label,parts,before,after,headings,words,duration=1500,windows}){
  return {id,title,sourcePages:pages,actionType:'place',placementDirection:[0,-1,0],guides:[],parts,
    states:['before','after'],initialState:'before',completionState:'after',
    transforms:Object.fromEntries(parts.map((id,i)=>[id,{before:pose(before[i]),after:pose(after[i])}])),
    animationStages:[{id:`place-${id}`,kind:'place',from:'before',to:'after',duration,easing:'smoothstep',tracks:parts,...(windows?{windows}:{})}],
    edition,partsLabel:label,stateLabels:{before:'準備組裝',after:'安裝完成'},
    headings:{before:headings[0],after:headings[1]},narration:{before:words[0],after:words[1]},subtitle:{before:words[0],after:words[1]},
    thumbnail:{before:reference(pages[0]),after:reference(pages.at(-1))},cameraFraming:{target:[0,1.2,-0.5],position:[12,13,18]}};
}
export const batch2Segments=[
  placement({id:'center-curved-seat',title:'Center Curved Seat',pages:[40,41],edition:'14 / 中央弧面座件',label:'1 × 棕色雙凸點弧面零件',
    parts:['center-curved-seat'],before:[[0,3.4,0]],after:[[0,0.58,0]],
    headings:['準備棕色雙凸點弧面零件','將弧面零件裝到底盤中央'],
    words:['準備棕色弧面零件，讓兩個凸點朝上、較高的一側朝後。','對準車體中央的白色底板，將棕色零件向下壓入定位。']}),
  {
    id:'front-bumper-module',title:'Front Bumper Subassembly',sourcePages:[42,43,44,45],actionType:'build-and-attach',guides:[],
    groupId:'front-bumper-group',parts:['bumper-bottom','bumper-wedge-left','bumper-spine','bumper-wedge-right','bumper-top'],
    states:['parts-ready','subassembly-built','attached'],initialState:'parts-ready',completionState:'attached',
    transforms:{
      'front-bumper-group':{'parts-ready':pose([0,3,5.7]),'subassembly-built':pose([0,3,5.7]),attached:pose([0,0.46,5.2])},
      ...Object.fromEntries([
        ['bumper-bottom',[0,0,0],[0,0,0]],
        ['bumper-wedge-left',[-3,0.8,0],[-1.6,0.24,0]],
        ['bumper-spine',[0,1.7,-1.6],[0,0.24,-1.6]],
        ['bumper-wedge-right',[3,0.8,0],[1.6,0.24,0]],
        ['bumper-top',[0,2.7,0],[0,0.48,0]]
      ].map(([id,ready,built])=>[id,{'parts-ready':pose(ready),'subassembly-built':pose(built),attached:pose(built)}]))
    },
    animationStages:[
      {id:'build-front-bumper',kind:'build',from:'parts-ready',to:'subassembly-built',duration:2200,easing:'smoothstep',
        tracks:['bumper-wedge-left','bumper-spine','bumper-wedge-right','bumper-top'],
        windows:{'bumper-wedge-left':[0,0.25],'bumper-spine':[0.25,0.65],'bumper-wedge-right':[0.25,0.65],'bumper-top':[0.65,1]},thumbnail:reference(43)},
      {id:'attach-front-bumper',kind:'attach',from:'subassembly-built',to:'attached',duration:1600,easing:'smoothstep',tracks:['front-bumper-group']}
    ],
    edition:'15 / 前方保險桿模組',partsLabel:'5 × 零件 · 先疊合，再整組安裝',
    stateLabels:{'parts-ready':'準備零件','subassembly-built':'小模組完成',attached:'安裝完成'},
    headings:{'parts-ready':'準備前方保險桿的五個零件','subassembly-built':'疊合黑色與黃色板件',attached:'將保險桿模組裝到底盤前端'},
    narration:{'parts-ready':'準備兩片黑色弧形板、兩片黃色角板和一片黃色長板。','subassembly-built':'在黑色底板上排好黃色板件，再蓋上另一片黑色弧形板。',attached:'讓黃色長板朝向車內，將整組模組放到底盤前端。'},
    subtitle:{'parts-ready':'準備兩片黑色弧形板、兩片黃色角板和一片黃色長板。','subassembly-built':'在黑色底板上排好黃色板件，再蓋上另一片黑色弧形板。',attached:'讓黃色長板朝向車內，將整組模組放到底盤前端。'},
    thumbnail:{'parts-ready':reference(42),'subassembly-built':reference(44),attached:reference(45)},
    cameraFraming:{target:[0,1.4,1.5],position:[12,14,20]}
  },
  placement({id:'front-white-spacer',title:'Front White Spacer',pages:[46,47],edition:'16 / 前方白色定位板',label:'1 × 白色雙凸點板',
    parts:['front-white-spacer'],before:[[0,3.2,4]],after:[[0,0.94,4]],
    headings:['準備白色雙凸點板','將白色板件裝在保險桿後方'],
    words:['準備白色雙凸點板，讓長邊橫跨車體中央。','對準前方黃色長板，將白色板件放到黑色保險桿後方。']}),
  placement({id:'front-amber-lights',title:'Front Amber Light Plates',pages:[48,49],edition:'17 / 前方橙色燈板',label:'2 × 透明橙色雙凸點板',
    parts:['amber-light-left','amber-light-right'],before:[[-1.6,3.2,4.8],[1.6,3.2,4.8]],after:[[-1.6,1.18,4.8],[1.6,1.18,4.8]],
    headings:['準備兩片透明橙色燈板','將橙色燈板裝到保險桿兩側'],
    words:['準備兩片透明橙色燈板，分別對準車頭左右兩側。','把兩片燈板放到黑色保險桿上，向下壓入定位。']}),
  placement({id:'front-clear-lights-trim',title:'Front Clear Lights and Trim',pages:[50,51],edition:'18 / 前燈與中央飾板',label:'2 × 透明斜角片 · 1 × 黑色飾板',
    parts:['clear-light-left','clear-light-right','front-trim'],before:[[-1.6,3.2,5.6],[1.6,3.2,5.6],[0,3.2,5.6]],after:[[-1.6,1.18,5.6],[1.6,1.18,5.6],[0,1.18,5.6]],
    headings:['準備透明前燈角片與飾板','將前燈與飾板裝到車頭前緣'],
    words:['準備兩片透明斜角片和黑色飾板，讓斜邊配合車頭兩端。','將透明角片壓入左右兩側，再把黑色飾板放到中央。'],duration:1800,
    windows:{'clear-light-left':[0,0.6],'clear-light-right':[0,0.6],'front-trim':[0.6,1]}}),
  placement({id:'steering-wheel-unit',title:'Steering Wheel Unit',pages:[52,53],edition:'19 / 方向盤座',label:'1 × 方向盤座',
    parts:['steering-wheel-unit'],before:[[0,3.5,1.6]],after:[[0,0.94,1.6]],
    headings:['準備方向盤座','將方向盤座裝到車內前方'],
    words:['準備方向盤座，讓方向盤朝向後方的棕色座件。','對準前方黃色長板的後端，將方向盤座向下壓入定位。']})
];
