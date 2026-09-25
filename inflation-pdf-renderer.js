(() => {
  'use strict';
  const P=()=>window.CarrowmontPdfExport,L=()=>window.CarrowmontLocale,S=()=>window.CarrowmontReportStandard;
  const C={ink:'#102945',navy:'#102945',teal:'#0e827a',tealDark:'#08756d',muted:'#405b75',line:'#c9d9e2',pale:'#e8f6f3',note:'#f3f8fa',white:'#fff',light:'#f8fbfc'};
  const W=794,H=1123,M=42,CW=W-M*2;
  const money=v=>L().formatMoney(v,{maximumFractionDigits:0}),compact=v=>L().formatCompactMoney(v,{maximumFractionDigits:2});
  function page(){return P().createPage({width:W,height:H,scale:2.6,background:'#fff'});}function card(ctx,x,y,w,h,fill=C.white,stroke=C.line,r=10){P().roundRect(ctx,x,y,w,h,r,fill,stroke,1);}function hline(ctx,x1,x2,y,color=C.line,width=1){P().line(ctx,x1,y,x2,y,color,width);}
  function header(ctx){const d=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date());P().text(ctx,'CARROWMONT',M,48,{size:14,weight:900,color:C.teal});P().text(ctx,'Inflation Planning Report',M,82,{size:26,weight:900,color:C.ink});P().text(ctx,'Prepared from the Carrowmont Inflation Calculator',M,104,{size:10.2,weight:600,color:C.muted});P().text(ctx,`Generated ${d}`,W-M,48,{size:10,weight:800,color:C.ink,align:'right'});P().text(ctx,'Educational planning report',W-M,68,{size:9.5,weight:400,color:C.muted,align:'right'});P().text(ctx,'carrowmont.com',W-M,88,{size:9.5,weight:400,color:C.muted,align:'right'});hline(ctx,M,W-M,125,C.navy,2);}
  function band(ctx,label,y){card(ctx,M,y,CW,31,C.navy,null,8);P().text(ctx,label,M+12,y+21,{size:14,weight:850,color:'#fff'});}
  function statGrid(ctx,items,y,cols=3){const gap=9,w=(CW-gap*(cols-1))/cols,h=72;items.forEach((it,i)=>{const row=Math.floor(i/cols),c=i%cols,x=M+c*(w+gap),yy=y+row*(h+9);card(ctx,x,yy,w,h,C.white,C.line,9);P().wrappedText(ctx,it.label,x+10,yy+19,w-20,{size:9.1,lineHeight:11.5,weight:600,color:C.muted,maxLines:2});P().text(ctx,it.value,x+10,yy+55,{size:14.2,weight:850,color:C.ink});});return y+Math.ceil(items.length/cols)*(h+9)-9;}
  function reportGuidePage(){
    return S().guidePage({
      reportTitle:'Inflation Planning Report',
      preparedFrom:'Carrowmont Inflation Calculator',
      howToRead:'Start with the future equivalent and purchasing-power result. Then compare the lower, entered and higher inflation scenarios and use the checkpoint table to understand how the effect compounds over time.',
      methodology:[
        ['Future cost','Future cost = amount today × (1 + inflation rate)^years. The entered rate is treated as a constant annual modelling assumption.'],
        ['Purchasing power',"Purchasing-power figures express how much of today's buying power the same nominal amount would retain after the selected period."],
        ['Scenario comparison','Lower and higher scenarios are illustrations around the entered inflation assumption; they are not forecasts.'],
        ['Country & currency','Country selection controls locale-aware formatting and the suggested default currency only. The calculator does not perform foreign-exchange conversion.']
      ],
      terminology:[
        ['Future equivalent','The nominal future amount estimated to have similar purchasing power to the amount entered today.'],
        ['Nominal amount',"The stated currency amount without adjusting it back to today's purchasing power."],
        ['Purchasing power remaining',"The modelled percentage of today's buying power retained by the same nominal amount."],
        ['Inflation assumption','The annual rate used to model price growth over the selected time horizon.'],
        ['Checkpoint','An intermediate year shown to make the compounding effect easier to read.']
      ],
      assumptions:'Inflation is modelled at a constant annual rate and can differ materially between households, goods, services and time periods. Currency selection changes formatting only and does not convert values between currencies.',
      disclaimer:'This report is an educational illustration based on the assumptions entered. It does not forecast future inflation and is not individualized financial, tax, legal or investment advice. Actual outcomes can differ materially.',
      methodologyMeta:'Current Inflation Calculator methodology - reviewed September 2026',
      methodologyUrl:'carrowmont.com/inflation-calculator/methodology.html',
      contact:'contact@carrowmont.com'
    });
  }
  function toolsPage(){
    return S().continuePlanningPage({currentTool:'inflation',intro:`Inflation affects nearly every financial goal. Use these other Carrowmont tools to connect purchasing power with ${S().investmentIdentity().planningPhrase}, retirement, life goals and financial independence.`});
  }
  async function render(m){
    const p1=page(),ctx=p1.ctx;header(ctx);P().text(ctx,'YOUR INFLATION ESTIMATE',M,160,{size:9,weight:900,color:C.teal});P().text(ctx,'Future cost and purchasing power',M,190,{size:22,weight:900,color:C.ink});
    card(ctx,M,216,CW,122,C.navy,null,16);P().text(ctx,`Future equivalent of ${money(m.state.amount)}${m.suffix}`,M+18,246,{size:10.5,weight:500,color:'#d7e2eb'});P().text(ctx,`${money(m.future)}${m.suffix}`,M+18,300,{size:38,weight:900,color:'#fff'});P().text(ctx,`After ${m.state.years} years at ${m.state.rate.toFixed(1)}% annual inflation`,M+18,323,{size:9.3,weight:400,color:'#d7e2eb'});
    let y=statGrid(ctx,[{label:'Amount today',value:`${money(m.state.amount)}${m.suffix}`},{label:'Time horizon',value:`${m.state.years} years`},{label:'Inflation assumption',value:`${m.state.rate.toFixed(1)}% p.a.`},{label:'Total price increase',value:`${Math.round(m.increase)}%`},{label:'Purchasing power remaining',value:`${Math.round(m.remaining)}%`},{label:'Same nominal amount in today\'s purchasing power',value:`${money(m.sameNominalToday)}${m.suffix}`}],365,3);
    band(ctx,'Scenario comparison',y+25);y+=68;const cols=[210,130,370],heads=['SCENARIO','INFLATION','FUTURE EQUIVALENT'];ctx.fillStyle='#eaf2f6';ctx.fillRect(M,y,CW,44);let x=M;heads.forEach((h,i)=>{P().text(ctx,h,i===0?x+8:x+cols[i]-8,y+27,{size:8.5,weight:850,color:'#173d5c',align:i===0?'left':'right'});x+=cols[i];});y+=44;[['Lower',m.lowRate, m.lowFuture],['Your assumption',m.state.rate,m.future],['Higher',m.highRate,m.highFuture]].forEach((r,idx)=>{if(idx===1){ctx.fillStyle='#e9f6f3';ctx.fillRect(M,y,CW,40);}const vals=[r[0],`${r[1].toFixed(1)}%`,`${money(r[2])}${m.suffix}`];x=M;vals.forEach((v,i)=>{P().text(ctx,v,i===0?x+8:x+cols[i]-8,y+25,{size:9.3,weight:idx===1?850:650,color:idx===1&&i===2?C.tealDark:C.ink,align:i===0?'left':'right'});x+=cols[i];});hline(ctx,M,M+CW,y+40);y+=40;});
    card(ctx,M,y+28,CW,116,C.note,C.line,10);P().text(ctx,'What this means',M+14,y+58,{size:15,weight:900,color:C.ink});P().wrappedText(ctx,`At the entered inflation rate, prices are modelled to rise by about ${Math.round(m.increase)}% over ${m.state.years} years. If the nominal budget stayed unchanged, its purchasing power would be about ${Math.round(m.remaining)}% of today\'s level.`,M+14,y+84,CW-28,{size:9.6,lineHeight:13.5,weight:500,color:C.muted,maxLines:3});
    const p2=page(),c2=p2.ctx;header(c2);P().text(c2,'Inflation journey',M,164,{size:19,weight:900,color:C.ink});P().wrappedText(c2,'The chart compares a lower inflation scenario, your entered assumption and a higher scenario. The table below gives checkpoints for the entered assumption.',M,188,CW,{size:9.5,lineHeight:13.5,weight:500,color:C.muted,maxLines:3});card(c2,M,225,CW,310,C.white,C.line,10);await P().drawSvgElement(c2,document.getElementById('inflationChart'),M+8,233,CW-16,294);
    band(c2,'Future cost checkpoints',558);let ty=603;const colw=[110,210,180,210];c2.fillStyle='#eaf2f6';c2.fillRect(M,ty,CW,50);let xx=M;['YEAR','FUTURE COST','PRICE INCREASE','PURCHASING POWER REMAINING'].forEach((h,i)=>{P().wrappedText(c2,h,i===0?xx+8:xx+colw[i]-8,ty+20,colw[i]-16,{size:8.1,lineHeight:10,weight:850,color:'#173d5c',align:i===0?'left':'right',maxLines:2});xx+=colw[i];});ty+=50;m.milestones.slice(0,8).forEach(row=>{xx=M;const vals=[row.label,`${money(row.future)}${m.suffix}`,row.increase,row.power];vals.forEach((v,i)=>{P().text(c2,v,i===0?xx+8:xx+colw[i]-8,ty+25,{size:9.1,weight:i===0?800:600,color:C.ink,align:i===0?'left':'right'});xx+=colw[i];});hline(c2,M,M+CW,ty+38);ty+=38;});
    return [p1.canvas,p2.canvas,reportGuidePage(),toolsPage()];
  }
  window.CarrowmontInflationPdfRenderer={render};
})();
