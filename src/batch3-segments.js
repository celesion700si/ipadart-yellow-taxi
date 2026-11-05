// Page 54–75 additions using the existing PLACE and BUILD_AND_ATTACH contracts.
// Page 72 is a bag-opening transition; it adds no assembly state.
const pose=position=>({position,rotation:[0,0,0]});
const reference=page=>({page,src:`public/instructions/page-${String(page).padStart(3,'0')}.png`});
function placement({id,title,pages,edition,label,parts,before,after,headings,words,duration=1500,windows,direction=[0,-1,0]}){
  return {id,title,sourcePages:pages,actionType:'place',...(direction?{placementDirection:direction}:{}),guides:[],parts,
    states:['before','after'],initialState:'before',completionState:'after',
    transforms:Object.fromEntries(parts.map((id,i)=>[id,{before:pose(before[i]),after:pose(after[i])}])),
    animationStages:[{id:`place-${id}`,kind:'place',from:'before',to:'after',duration,easing:'smoothstep',tracks:parts,...(windows?{windows}:{})}],
    edition,partsLabel:label,stateLabels:{before:'準備組裝',after:'安裝完成'},
    headings:{before:headings[0],after:headings[1]},narration:{before:words[0],after:words[1]},subtitle:{before:words[0],after:words[1]},
    thumbnail:{before:reference(pages[0]),after:reference(pages.at(-1))},cameraFraming:{target:[0,1.2,-0.5],position:[12,13,18]}};
}
const local=(a,b)=>({'parts-ready':pose(a),'subassembly-built':pose(b),attached:pose(b)});
export const batch3Segments=[{
 id:'front-hinge-module',title:'Front Hinge Module',sourcePages:[54,55,56,57],actionType:'build-and-attach',guides:[],
 groupId:'front-hinge-group',parts:['hinge-white-brick','hinge-blue-pin','hinge-gray-link'],
 states:['parts-ready','subassembly-built','attached'],initialState:'parts-ready',completionState:'attached',
 transforms:{'front-hinge-group':{'parts-ready':pose([0,3,3]),'subassembly-built':pose([0,3,3]),attached:pose([0,1.3,2.4])},
  'hinge-white-brick':local([0,0,0],[0,0,0]),'hinge-blue-pin':local([0,0,2.4],[0,0,0.58]),'hinge-gray-link':local([0,0,3.5],[0,0,1.05])},
 animationStages:[
  {id:'build-front-hinge',kind:'build',from:'parts-ready',to:'subassembly-built',duration:1800,easing:'smoothstep',tracks:['hinge-blue-pin','hinge-gray-link'],windows:{'hinge-blue-pin':[0,0.5],'hinge-gray-link':[0.5,1]},thumbnail:reference(55)},
  {id:'attach-front-hinge',kind:'attach',from:'subassembly-built',to:'attached',duration:1500,easing:'smoothstep',tracks:['front-hinge-group']}],
 edition:'20 / 前方連接模組',partsLabel:'3 × 零件 · 先連接，再整組安裝',stateLabels:{'parts-ready':'準備零件','subassembly-built':'小模組完成',attached:'安裝完成'},
 headings:{'parts-ready':'準備孔磚、插銷與連接件','subassembly-built':'將插銷與連接件裝到白色孔磚',attached:'將連接模組裝到底盤前方'},
 narration:{'parts-ready':'準備白色孔磚、藍色插銷和灰色連接件，對齊孔位。','subassembly-built':'先把藍色插銷插入白色孔磚，再套上灰色連接件。',attached:'讓灰色連接件朝向車頭，將整組模組向下安裝定位。'},
 subtitle:{'parts-ready':'準備白色孔磚、藍色插銷和灰色連接件，對齊孔位。','subassembly-built':'先把藍色插銷插入白色孔磚，再套上灰色連接件。',attached:'讓灰色連接件朝向車頭，將整組模組向下安裝定位。'},
 thumbnail:{'parts-ready':reference(54),'subassembly-built':reference(56),attached:reference(57)},cameraFraming:{target:[0,1.4,1.5],position:[12,14,20]}
},
 placement({id:'blue-battery-tiles',title:'Blue Battery Tiles',pages:[58,59],edition:'21 / 藍色電池飾板',label:'2 × 藍色印花平板',
  parts:['battery-tile-left','battery-tile-right'],before:[[-0.4,3.4,4.4],[0.4,3.4,4.4]],after:[[-0.4,1.18,4.4],[0.4,1.18,4.4]],
  headings:['準備兩片藍色印花平板','將藍色平板並排裝到車頭中央'],
  words:['準備兩片藍色印花平板，讓圖案朝上並排對齊。','將兩片平板放到前方中央的凸點上，向下壓入定位。']}),
 placement({id:'front-round-spacers',title:'Front Round Spacers',pages:[60,61],edition:'22 / 前方圓形定位片',label:'2 × 灰色圓形薄片',
  parts:['front-round-left','front-round-right'],before:[[-1.2,3.3,4.8],[1.2,3.3,4.8]],after:[[-1.2,1.42,4.8],[1.2,1.42,4.8]],
  headings:['準備兩個灰色圓形薄片','將圓形薄片裝到橙色燈板上'],
  words:['準備兩個灰色圓形薄片，對準橙色燈板靠內的凸點。','將兩個圓形薄片向下壓好，分別位在藍色平板的左右兩側。']}),
 placement({id:'front-wheel-arches',title:'Front Wheel Arches',pages:[62,63],edition:'23 / 前輪拱',label:'2 × 黃色輪拱',
  parts:['front-arch-left','front-arch-right'],before:[[-1.6,4,3.2],[1.6,4,3.2]],after:[[-1.6,0.34,3.2],[1.6,0.34,3.2]],
  headings:['準備兩個黃色前輪拱','將輪拱裝到車頭左右兩側'],
  words:['準備兩個黃色輪拱，讓拱形開口朝向車體外側。','對準前方兩側的位置，將兩個輪拱向下壓入定位。']}),
 placement({id:'blue-side-plates',title:'Blue Side Plates',pages:[64,65],edition:'24 / 藍色側板',label:'2 × 藍色 2 × 4 板',direction:null,
  parts:['blue-side-left','blue-side-right'],before:[[-4.4,1.05,0],[4.4,1.05,0]],after:[[-2.1,1.05,0],[2.1,1.05,0]],
  headings:['準備兩片藍色側板','將藍色側板裝到車身兩側'],
  words:['準備兩片藍色側板，讓凸點朝外，對準車身兩側的灰色支架。','從左右兩側向內壓入，將藍色側板固定在支架上。']}),
 placement({id:'taxi-side-signs',title:'Taxi Side Signs',pages:[66,67],edition:'25 / TAXI 車側飾板',label:'2 × 黃色 TAXI 印花飾板',direction:null,
  parts:['taxi-sign-left','taxi-sign-right'],before:[[-4.5,1.05,0],[4.5,1.05,0]],after:[[-2.34,1.05,0],[2.34,1.05,0]],
  headings:['準備兩片 TAXI 車側飾板','將 TAXI 飾板裝到藍色側板上'],
  words:['準備兩片黃色 TAXI 飾板，讓文字朝外並保持正立。','對準藍色側板的凸點，從左右向內壓入固定。']}),
 placement({id:'yellow-side-rails',title:'Yellow Side Rails',pages:[68,69],edition:'26 / 黃色側邊長板',label:'2 × 黃色 1 × 8 長板',
  parts:['side-rail-left','side-rail-right'],before:[[-2,4.8,0],[2,4.8,0]],after:[[-2,3.2,0],[2,3.2,0]],
  headings:['準備兩片黃色長板','將長板跨接在前後輪拱上'],
  words:['準備兩片黃色長板，沿著車身前後方向對齊。','將長板放在左右外側，連接前後輪拱並向下壓好。']}),
 placement({id:'front-black-trim',title:'Front Black Trim',pages:[70,71],edition:'27 / 前方黑色飾板',label:'1 × 黑色橫板 · 2 × 圓角飾片',
  parts:['front-black-bar','front-quarter-left','front-quarter-right'],before:[[0,5,2.8],[-1.2,5,2],[1.2,5,2]],after:[[0,3.2,2.8],[-1.2,3.2,2],[1.2,3.2,2]],
  headings:['準備黑色橫板與圓角飾片','完成車頭後緣的黑色飾板'],
  words:['準備黑色橫板和兩片圓角飾片，確認左右方向。','先放好中央橫板，再將兩片圓角飾片壓入後方兩側。'],duration:1800,windows:{'front-black-bar':[0,0.5],'front-quarter-right':[0.5,0.75],'front-quarter-left':[0.75,1]}}),
 placement({id:'traveler-minifigure',title:'Traveler Minifigure',pages:[73],edition:'28 / 旅客人偶',label:'人偶 4 部分 · 2 件行李',direction:null,
  parts:['traveler-legs','traveler-torso','traveler-head','traveler-hair','traveler-case','traveler-bag'],
  before:[[4,0,-1],[4,4,-1],[5.4,4.6,-1],[6.5,5.2,-1],[3,3,-1],[5,3,-1]],
  after:[[4,0,-1],[4,1.65,-1],[4,2.55,-1],[4,3.05,-1],[3.05,0.75,-1],[4.95,0.75,-1]],
  headings:['準備旅客人偶與行李','完成旅客人偶與兩件行李'],
  words:['準備人偶的雙腿、身體、頭和頭髮，再準備兩件行李。','依序裝好身體、頭和頭髮，最後讓雙手拿好行李。'],duration:2600,
  windows:{'traveler-legs':[0,1],'traveler-torso':[0,0.3],'traveler-head':[0.3,0.5],'traveler-hair':[0.5,0.7],'traveler-case':[0.7,1],'traveler-bag':[0.7,1]}}),
 placement({id:'front-yellow-corners',title:'Front Yellow Corner Plates',pages:[74,75],edition:'29 / 前方黃色 L 形板',label:'2 × 黃色 L 形板',
  parts:['front-l-left','front-l-right'],before:[[-1.6,4.8,4],[1.6,4.8,4]],after:[[-1.6,3.2,4],[1.6,3.2,4]],
  headings:['準備兩片黃色 L 形板','將 L 形板裝到前輪拱頂部'],
  words:['準備兩片黃色 L 形板，對照左右兩側的缺口方向。','將兩片 L 形板對準前輪拱頂部，向下壓入固定。']})
];
