(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.CarrowmontInflationCore=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';

  const VERSION='INFLATION-CORE-1.0';
  function futureValue(amount,ratePct,years){return amount*Math.pow(1+ratePct/100,years);}
  function presentEquivalent(amount,ratePct,years){return amount/Math.pow(1+ratePct/100,years);}
  function calculate(s={}){
    const amount=Number(s.amount)||0,years=Number(s.years)||0,rate=Number(s.rate)||0;
    const factor=Math.pow(1+rate/100,years);
    const future=amount*factor;
    const sameNominalToday=presentEquivalent(amount,rate,years);
    const increase=(factor-1)*100;
    const remaining=factor===0?100:(1/factor)*100;
    const loss=100-remaining;
    const extra=future-amount;
    const lowRate=Math.max(0,rate-2),highRate=rate+2;
    const lowFuture=futureValue(amount,lowRate,years),highFuture=futureValue(amount,highRate,years);
    const doublingYears=rate>0?Math.log(2)/Math.log(1+rate/100):null;
    return {factor,future,sameNominalToday,increase,remaining,loss,extra,lowRate,highRate,lowFuture,highFuture,doublingYears};
  }
  return Object.freeze({VERSION,futureValue,presentEquivalent,calculate});
});
