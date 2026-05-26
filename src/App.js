import { useState } from "react";

const fmt    = (n) => new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n);
const fmtPct = (n) => `${n.toFixed(1)}%`;
const today  = () => new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});

const BRAND = {
  gold:"#C9A96E", goldDim:"rgba(201,169,110,0.15)",
  bg:"#07111a", bgCard:"#0c1b28", bgDeep:"#060e18",
  border:"rgba(201,169,110,0.18)", borderFaint:"rgba(255,255,255,0.06)",
  text:"#f0ede8", textMid:"#7a8fa8", textDim:"#3d5060",
  green:"#4ade80", amber:"#fbbf24", red:"#f87171",
};

const HURDLES = [
  {key:"netCashflow",   label:"Net Cashflow/Month", min:200,   good:350,   unit:"£", fmt:(v)=>fmt(v),                     desc:"Cash in your pocket after every cost"},
  {key:"grossYield",    label:"Gross Yield",         min:6,     good:8,     unit:"%", fmt:(v)=>fmtPct(v),                  desc:"Annual gross rent ÷ GDV"},
  {key:"netYield",      label:"Net Yield on Cash",   min:8,     good:12,    unit:"%", fmt:(v)=>v===Infinity?"∞":fmtPct(v), desc:"Annual net income ÷ cash tied up"},
  {key:"cashOnCash",    label:"Cash-on-Cash",        min:8,     good:15,    unit:"%", fmt:(v)=>v===Infinity?"∞":fmtPct(v), desc:"Best ROI measure — net income ÷ net cash in"},
  {key:"recycleRate",   label:"Capital Recycled",    min:60,    good:85,    unit:"%", fmt:(v)=>fmtPct(v),                  desc:"% of cash in pulled back out at refi"},
  {key:"equityCreated", label:"Equity Created",      min:10000, good:25000, unit:"£", fmt:(v)=>fmt(v),                    desc:"GDV minus purchase price minus refurb"},
  {key:"dealROI",       label:"Total Deal ROI",      min:15,    good:30,    unit:"%", fmt:(v)=>fmtPct(v),                  desc:"(Equity created + annual net) ÷ total cash in"},
  {key:"icr",           label:"Interest Cover",      min:125,   good:145,   unit:"%", fmt:(v)=>fmtPct(v),                  desc:"Effective rent ÷ mortgage. Lenders min 125%"},
];

const hColor  = (v,min,good) => v===Infinity||v>=good ? BRAND.green : v>=min ? BRAND.amber : BRAND.red;
const hStatus = (v,min,good) => v===Infinity||v>=good ? "PASS ✓"   : v>=min ? "MARGINAL"  : "FAIL ✗";

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

const Slider = ({label,value,setValue,min,max,step=1,prefix="",suffix="",hint}) => (
  <div style={{marginBottom:"1.5rem"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.4rem"}}>
      <span style={{fontSize:"0.72rem",color:BRAND.textMid,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace"}}>{label}</span>
      <span style={{fontSize:"1rem",color:BRAND.text,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{prefix}{value.toLocaleString("en-GB")}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e=>setValue(Number(e.target.value))}
      style={{width:"100%",accentColor:BRAND.gold,cursor:"pointer",height:"6px"}}/>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.25rem"}}>
      <span style={{fontSize:"0.62rem",color:BRAND.textDim}}>{prefix}{min.toLocaleString()}{suffix}</span>
      <span style={{fontSize:"0.62rem",color:BRAND.textDim}}>{prefix}{max.toLocaleString()}{suffix}</span>
    </div>
    {hint&&<div style={{fontSize:"0.68rem",color:BRAND.textDim,marginTop:"0.3rem",fontStyle:"italic"}}>{hint}</div>}
  </div>
);

const Row = ({label,value,color,bold,border=true,indent}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
    padding:bold?"0.65rem 0 0.55rem":"0.45rem 0",paddingLeft:indent?"0.9rem":0,
    borderBottom:border?`1px solid ${BRAND.borderFaint}`:"none",
    borderTop:bold?`1px solid ${BRAND.goldDim}`:"none",marginTop:bold?"0.5rem":0}}>
    <span style={{fontSize:bold?"0.8rem":"0.73rem",color:bold?"#c9d8e8":indent?"#3d6070":"#5a7088",
      fontFamily:"'Space Mono',monospace",fontWeight:bold?700:400,fontStyle:indent?"italic":"normal"}}>{label}</span>
    <span style={{fontSize:bold?"0.95rem":"0.8rem",color:color||(bold?BRAND.text:"#8fa8be"),
      fontFamily:"'Space Mono',monospace",fontWeight:bold?700:500}}>{value}</span>
  </div>
);

const Card = ({label,value,sub,color,dim}) => (
  <div style={{background:dim?"rgba(255,255,255,0.02)":"rgba(201,169,110,0.06)",
    border:`1px solid ${dim?BRAND.borderFaint:BRAND.border}`,borderRadius:"12px",padding:"1rem 1.1rem"}}>
    <div style={{fontSize:"0.62rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",
      textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.35rem"}}>{label}</div>
    <div style={{fontSize:"1.3rem",fontWeight:700,color:color||BRAND.gold,
      fontFamily:"'Space Mono',monospace",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:"0.65rem",color:BRAND.textDim,marginTop:"0.3rem"}}>{sub}</div>}
  </div>
);

const SecHead = ({title}) => (
  <div style={{display:"flex",alignItems:"center",gap:"0.7rem",margin:"1.4rem 0 0.9rem"}}>
    <span style={{fontSize:"0.62rem",color:BRAND.gold,letterSpacing:"0.14em",textTransform:"uppercase",
      fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>{title}</span>
    <div style={{flex:1,height:"1px",background:BRAND.goldDim}}/>
  </div>
);

const HurdleBar = ({h,val}) => {
  const color=hColor(val,h.min,h.good), status=hStatus(val,h.min,h.good);
  const pct=val===Infinity?100:Math.min(100,(val/h.good)*100);
  return (
    <div style={{background:BRAND.bgCard,border:`1px solid ${color}33`,borderRadius:"14px",padding:"1rem 1.2rem",marginBottom:"0.75rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
        <div style={{flex:1,paddingRight:"1rem"}}>
          <div style={{fontSize:"0.82rem",fontFamily:"'Space Mono',monospace",color:"#c9d8e8",fontWeight:700,marginBottom:"0.25rem"}}>{h.label}</div>
          <div style={{fontSize:"0.68rem",color:BRAND.textDim,fontStyle:"italic",lineHeight:1.4}}>{h.desc}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:"1.3rem",fontWeight:700,color,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{h.fmt(val)}</div>
          <div style={{fontSize:"0.65rem",color,fontFamily:"'Space Mono',monospace",marginTop:"0.2rem",letterSpacing:"0.06em"}}>{status}</div>
        </div>
      </div>
      <div style={{height:"10px",background:"rgba(255,255,255,0.07)",borderRadius:"8px",overflow:"hidden",marginBottom:"0.4rem"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:"8px",transition:"width 0.4s ease",boxShadow:`0 0 8px ${color}55`}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:"0.65rem",color:BRAND.red,fontFamily:"'Space Mono',monospace"}}>Min: {h.unit==="£"?fmt(h.min):`${h.min}${h.unit}`}</span>
        <span style={{fontSize:"0.65rem",color:BRAND.green,fontFamily:"'Space Mono',monospace"}}>Good: {h.unit==="£"?fmt(h.good):`${h.good}${h.unit}`}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF builder
// ─────────────────────────────────────────────────────────────────────────────

function buildPDFHTML(data) {
  const {
    propertyName,propertyAddress,notes,
    purchasePrice,purchaseLTV,legalCosts,surveyFee,sdlt,
    purchaseDeposit,purchaseMortgage,totalCashIn,
    refurbCost,refurbWeeks,
    monthlyRent,rentalGrowthRate,voidRate,managementRate,maintenanceRate,
    refinanceValue,refinanceLTV,interestRate,refinanceFee,
    refiMortgage,monthlyMortgage,capitalRecycled,netCashIn,fullyRecycled,
    voidDeduction,monthlyMgmt,monthlyMaint,monthlyInsurance,
    netBeforeContingency,netAfterContingency,
    grossYield,valueAdd,recycleRate,icr,
    hurdleValues,passCount,goodCount,
    verdict,verdictLabel,
    annualGrowthRate,roiRowsFull,lastRow,roi10,ann10,leveragedGain,
  } = data;

  const hC = (v,min,good) => v===Infinity||v>=good?"#16a34a":v>=min?"#d97706":"#dc2626";
  const hS = (v,min,good) => v===Infinity||v>=good?"PASS ✓":v>=min?"MARGINAL":"FAIL ✗";
  const vColor = verdict==="excellent"?"#16a34a":verdict==="solid"?"#b45309":verdict==="marginal"?"#d97706":"#dc2626";

  const pRow = (l,v,bold=false,color="#374151") =>
    `<tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:7px 10px;font-size:12px;color:${bold?"#111827":"#6b7280"};font-weight:${bold?700:400}">${l}</td>
      <td style="padding:7px 10px;font-size:12px;color:${color};font-weight:${bold?700:500};text-align:right">${v}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BRR Report — ${propertyName||"Unnamed Deal"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#fff;color:#111827;font-size:13px}
  .page{max-width:780px;margin:0 auto;padding:32px 28px 60px}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .no-print{display:none!important}
    .page{padding:20px}
    @page{margin:15mm}
  }
  h2{font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.1em;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #C9A96E}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px}
  .metric{background:#fffbf5;border:1px solid #e5d5b0;border-radius:8px;padding:12px 14px}
  .metric-label{font-size:10px;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}
  .metric-value{font-size:20px;font-weight:700;line-height:1}
  .metric-sub{font-size:10px;color:#9ca3af;margin-top:3px}
  .hurdle-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f3f4f6}
  .hurdle-bar-bg{height:7px;background:#f3f4f6;border-radius:4px;margin-top:5px;overflow:hidden}
  .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
  .tbl-roi{width:100%;border-collapse:collapse;font-size:11px}
  .tbl-roi th{background:#1f2937;color:#f9fafb;padding:7px 8px;text-align:left;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.05em}
  .tbl-roi td{padding:6px 8px;border-bottom:1px solid #f3f4f6}
  .tbl-roi tr:nth-child(even) td{background:#f9fafb}
  .disclaimer{font-size:10px;color:#9ca3af;line-height:1.6;padding:10px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-top:12px}
  .print-btn{display:block;width:100%;margin:24px 0 0;padding:14px;background:#C9A96E;color:#1c0f00;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.04em}
  .print-btn:hover{background:#e0c48a}
</style>
</head>
<body>
<div class="page">

  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #C9A96E">
    <div>
      <div style="font-size:10px;color:#92400e;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px">Nelson Brierley Properties Limited</div>
      <div style="font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.02em">${propertyName||"BRR Deal Report"}</div>
      ${propertyAddress?`<div style="font-size:12px;color:#6b7280;margin-top:3px">${propertyAddress}</div>`:""}
    </div>
    <div style="text-align:right;flex-shrink:0;margin-left:20px">
      <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Date Generated</div>
      <div style="font-size:13px;font-weight:600;color:#374151;margin-top:2px">${today()}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:6px">For internal use only</div>
    </div>
  </div>

  <!-- VERDICT -->
  <div style="background:${vColor}11;border:2px solid ${vColor};border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
    <div>
      <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Deal Verdict</div>
      <div style="font-size:22px;font-weight:700;color:${vColor}">${verdictLabel}</div>
      ${fullyRecycled?`<div style="font-size:11px;color:#16a34a;margin-top:4px">✓ Full capital recycle achieved</div>`:""}
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge" style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0">${goodCount}/${HURDLES.length} hurdles — Good</span>
        <span class="badge" style="background:#fffbeb;color:#d97706;border:1px solid #fde68a">${passCount} total pass</span>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Net Cashflow / Month</div>
      <div style="font-size:30px;font-weight:700;color:${netAfterContingency>0?vColor:"#dc2626"};line-height:1">${fmt(netAfterContingency)}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:3px">incl. all contingencies</div>
      <div style="font-size:15px;font-weight:600;color:#16a34a;margin-top:2px">${fmt(netBeforeContingency)} <span style="font-size:10px;color:#9ca3af;font-weight:400">excl.</span></div>
    </div>
  </div>

  <!-- KEY METRICS -->
  <h2>Key Metrics</h2>
  <div class="grid3">
    ${[
      ["Total Cash In",    fmt(totalCashIn),               "Before refinance",          "#374151"],
      ["Capital Recycled", fmt(Math.max(0,capitalRecycled)),`${Math.min(100,Math.round(recycleRate))}% back out`, recycleRate>=85?"#16a34a":recycleRate>=60?"#b45309":"#dc2626"],
      ["Net Cash Left In", netCashIn<=0?"£0 ✓":fmt(netCashIn),"Permanently tied up",    netCashIn<=0?"#16a34a":"#374151"],
      ["Gross Yield",      fmtPct(grossYield),              "On GDV",                    grossYield>=8?"#16a34a":grossYield>=6?"#d97706":"#dc2626"],
      ["Equity Created",   fmt(Math.max(0,valueAdd)),       "GDV − purchase − refurb",  valueAdd>=25000?"#16a34a":valueAdd>=10000?"#d97706":"#dc2626"],
      ["ICR",              fmtPct(icr),                     "Lenders min 125%",          icr>=145?"#16a34a":icr>=125?"#d97706":"#dc2626"],
    ].map(([l,v,s,c])=>`<div class="metric"><div class="metric-label">${l}</div><div class="metric-value" style="color:${c}">${v}</div><div class="metric-sub">${s}</div></div>`).join("")}
  </div>

  <!-- CAPITAL STACK + CASHFLOW -->
  <div class="grid2">
    <div>
      <h2>Capital Stack</h2>
      <table>
        ${pRow("Purchase Deposit",fmt(purchaseDeposit))}
        ${pRow("SDLT (Ltd Co. 3%)",fmt(sdlt))}
        ${pRow("Legal Costs",fmt(legalCosts))}
        ${surveyFee>0?pRow("Survey Fee",fmt(surveyFee)):""}
        ${pRow("Refurb Budget",fmt(refurbCost))}
        ${pRow("Total Cash In",fmt(totalCashIn),true,"#92400e")}
        ${pRow("Refinance Mortgage",fmt(refiMortgage))}
        ${pRow("Less: Purchase Mortgage",`-${fmt(purchaseMortgage)}`)}
        ${pRow("Refinance Fee",`-${fmt(refinanceFee)}`)}
        ${pRow("Net Capital Recycled",fmt(Math.max(0,capitalRecycled-refinanceFee)),true,"#16a34a")}
        ${pRow("Cash Permanently Tied Up",netCashIn<=0?"£0":fmt(netCashIn),true,netCashIn<=0?"#16a34a":"#111827")}
      </table>
    </div>
    <div>
      <h2>Monthly Cashflow</h2>
      <table>
        ${pRow("Gross Rent",fmt(monthlyRent))}
        ${pRow("Mortgage (IO)",`-${fmt(monthlyMortgage)}`)}
        ${pRow(`Management (${managementRate}%)`,`-${fmt(monthlyMgmt)}`)}
        ${pRow("Insurance",`-${fmt(monthlyInsurance)}`)}
        ${pRow("Net (excl. contingencies)",fmt(netBeforeContingency),true,"#16a34a")}
        ${pRow(`Void reserve (${voidRate}%)`,`-${fmt(voidDeduction)}`,"","#d97706")}
        ${pRow(`Maintenance (${maintenanceRate}%)`,`-${fmt(monthlyMaint)}`,"","#d97706")}
        ${pRow("Net (incl. contingencies)",fmt(netAfterContingency),true,netAfterContingency>=200?"#16a34a":"#d97706")}
      </table>
      <h2>Deal Inputs</h2>
      <table>
        ${pRow("Purchase Price",fmt(purchasePrice))}
        ${pRow("Purchase LTV",`${purchaseLTV}%`)}
        ${pRow("GDV (post refurb)",fmt(refinanceValue))}
        ${pRow("Refinance LTV",`${refinanceLTV}%`)}
        ${pRow("Interest Rate",`${interestRate}%`)}
        ${pRow("Refurb Duration",`${refurbWeeks} weeks`)}
        ${pRow("Monthly Rent (Yr 1)",fmt(monthlyRent))}
        ${pRow("Rental Growth YoY",`${rentalGrowthRate}%`)}
        ${pRow("Capital Growth YoY",`${annualGrowthRate}%`)}
      </table>
    </div>
  </div>

  <!-- HURDLES -->
  <h2>Hurdle Rate Assessment</h2>
  <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px">
    ${HURDLES.map(h=>{
      const val=hurdleValues[h.key];
      const c=hC(val,h.min,h.good),s=hS(val,h.min,h.good);
      const pct=val===Infinity?100:Math.min(100,(val/h.good)*100);
      return `<div class="hurdle-row">
        <div style="flex:1">
          <div style="font-size:12px;font-weight:600;color:#111827">${h.label}</div>
          <div style="font-size:10px;color:#9ca3af;font-style:italic">${h.desc}</div>
          <div class="hurdle-bar-bg"><div style="height:100%;width:${pct}%;background:${c};border-radius:4px"></div></div>
          <div style="display:flex;justify-content:space-between;margin-top:2px">
            <span style="font-size:9px;color:#dc2626">Min: ${h.unit==="£"?fmt(h.min):`${h.min}${h.unit}`}</span>
            <span style="font-size:9px;color:#16a34a">Good: ${h.unit==="£"?fmt(h.good):`${h.good}${h.unit}`}</span>
          </div>
        </div>
        <div style="text-align:right;margin-left:16px;flex-shrink:0">
          <div style="font-size:18px;font-weight:700;color:${c}">${h.fmt(val)}</div>
          <div style="font-size:10px;color:${c};font-weight:700;letter-spacing:0.05em">${s}</div>
        </div>
      </div>`;
    }).join("")}
  </div>

  <!-- ROI TABLE -->
  <h2>10-Year ROI Projection</h2>
  <div class="grid2" style="margin-bottom:12px">
    ${[
      ["10-Yr Total ROI",       netCashIn<=0?"∞":fmtPct(roi10),  roi10>=100||netCashIn<=0?"#16a34a":roi10>=50?"#d97706":"#dc2626"],
      ["Annualised Return",     netCashIn<=0?"∞":fmtPct(ann10),  ann10>=15||netCashIn<=0?"#16a34a":ann10>=8?"#d97706":"#dc2626"],
      ["Cumul. Cashflow (10yr)",fmt(lastRow.cumCash),             "#92400e"],
      ["Capital Growth (10yr)", fmt(leveragedGain),               leveragedGain>0?"#16a34a":"#dc2626"],
    ].map(([l,v,c])=>`<div class="metric"><div class="metric-label">${l}</div><div class="metric-value" style="color:${c}">${v}</div></div>`).join("")}
  </div>
  <table class="tbl-roi">
    <thead><tr><th>Yr</th><th>Rent/mo</th><th>Property Value</th><th>Equity</th><th>Cum. Cashflow</th><th>Total Return</th></tr></thead>
    <tbody>
      ${roiRowsFull.map(r=>`<tr>
        <td style="font-weight:700;color:#92400e">${r.yr}</td>
        <td>${fmt(r.rent)}</td>
        <td>${fmt(r.propVal)}</td>
        <td>${fmt(r.equity)}</td>
        <td style="color:${r.cumCash>0?"#16a34a":"#dc2626"}">${fmt(r.cumCash)}</td>
        <td style="font-weight:700;color:${r.totalRet>0?"#16a34a":"#dc2626"}">${fmt(r.totalRet)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  ${notes?`<h2 style="margin-top:16px">Notes</h2>
  <div style="padding:12px 14px;background:#fffbf5;border:1px solid #e5d5b0;border-radius:8px;font-size:12px;color:#374151;line-height:1.6;white-space:pre-wrap">${notes}</div>`:""}

  <div class="disclaimer">
    <strong style="color:#374151">Disclaimer:</strong> This report is produced by Nelson Brierley Properties Limited for internal analysis purposes only. All projections are illustrative and not guaranteed. Figures exclude corporation tax on rental profits, future remortgage costs, and selling costs (~2–3% of sale price). Consult your accountant and solicitor before proceeding with any investment.
  </div>

  <button class="print-btn no-print" onclick="window.print()">⬇ &nbsp; Save as PDF</button>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────

const TABS   = [{id:"inputs",label:"Inputs"},{id:"results",label:"Results"},{id:"hurdles",label:"Hurdles"},{id:"roi",label:"ROI"}];
const PHASES = ["Buy","Refurb","Rent","Refi","Repeat"];

export default function App() {
  const [tab, setTab] = useState("inputs");
  const [propertyName,    setPropertyName]    = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [notes,           setNotes]           = useState("");
  const [purchasePrice,   setPurchasePrice]   = useState(90000);
  const [purchaseLTV,     setPurchaseLTV]     = useState(75);
  const [legalCosts,      setLegalCosts]      = useState(2500);
  const [surveyFee,       setSurveyFee]       = useState(0);
  const [refurbCost,      setRefurbCost]      = useState(15000);
  const [refurbWeeks,     setRefurbWeeks]     = useState(10);
  const [monthlyRent,     setMonthlyRent]     = useState(700);
  const [rentalGrowthRate,setRentalGrowthRate]= useState(2);
  const [voidRate,        setVoidRate]        = useState(6);
  const [managementRate,  setManagementRate]  = useState(10);
  const [maintenanceRate, setMaintenanceRate] = useState(8);
  const [insurance,       setInsurance]       = useState(900);
  const [refinanceValue,  setRefinanceValue]  = useState(130000);
  const [refinanceLTV,    setRefinanceLTV]    = useState(75);
  const [interestRate,    setInterestRate]    = useState(5.5);
  const [refinanceFee,    setRefinanceFee]    = useState(1500);
  const [annualGrowthRate,setAnnualGrowthRate]= useState(3);

  // Calculations
  const calcSDLT = p => p<=250000?p*0.05:p<=925000?250000*0.05+(p-250000)*0.08:250000*0.05+675000*0.08+(p-925000)*0.13;
  const sdlt             = calcSDLT(purchasePrice);
  const purchaseDeposit  = purchasePrice*(1-purchaseLTV/100);
  const purchaseMortgage = purchasePrice*(purchaseLTV/100);
  const totalCashIn      = purchaseDeposit+sdlt+legalCosts+surveyFee+refurbCost;
  const refiMortgage     = refinanceValue*(refinanceLTV/100);
  const monthlyMortgage  = (refiMortgage*(interestRate/100))/12;
  const capitalRecycled  = refiMortgage-purchaseMortgage;
  const netCashIn        = Math.max(0,totalCashIn+refinanceFee-Math.max(0,capitalRecycled));
  const fullyRecycled    = capitalRecycled>=totalCashIn;
  const voidDeduction    = monthlyRent*(voidRate/100);
  const effectiveRent    = monthlyRent-voidDeduction;
  const monthlyMgmt      = effectiveRent*(managementRate/100);
  const monthlyMaint     = effectiveRent*(maintenanceRate/100);
  const monthlyInsurance = insurance/12;
  const refurbVoidCost   = (refurbWeeks/52)*monthlyRent*12;
  const hardCosts            = monthlyMortgage+monthlyMgmt+monthlyInsurance;
  const netBeforeContingency = monthlyRent-hardCosts;
  const netAfterContingency  = effectiveRent-hardCosts-monthlyMaint;
  const netCashflow          = netAfterContingency;
  const annualNet            = netCashflow*12;
  const grossYield    = ((monthlyRent*12)/refinanceValue)*100;
  const netYield      = netCashIn<=0?Infinity:(annualNet/netCashIn)*100;
  const cashOnCash    = netCashIn<=0?Infinity:(annualNet/netCashIn)*100;
  const valueAdd      = refinanceValue-purchasePrice-refurbCost;
  const recycleRate   = totalCashIn>0?Math.min(100,(capitalRecycled/totalCashIn)*100):0;
  const dealROI       = totalCashIn>0?((valueAdd+annualNet)/totalCashIn)*100:0;
  const icr           = monthlyMortgage>0?(effectiveRent/monthlyMortgage)*100:999;
  const hurdleValues  = {netCashflow,grossYield,netYield,cashOnCash,recycleRate,equityCreated:valueAdd,dealROI,icr};
  const passCount     = HURDLES.filter(h=>hurdleValues[h.key]>=h.min||hurdleValues[h.key]===Infinity).length;
  const goodCount     = HURDLES.filter(h=>hurdleValues[h.key]>=h.good||hurdleValues[h.key]===Infinity).length;
  const verdict       = goodCount>=5&&netCashflow>=200?"excellent":passCount>=6&&netCashflow>0?"solid":passCount>=4?"marginal":"avoid";
  const verdictLabel  = {excellent:"Excellent BRRR",solid:"Solid Deal",marginal:"Marginal",avoid:"Avoid"}[verdict];
  const verdictColor  = {excellent:BRAND.green,solid:BRAND.gold,marginal:BRAND.amber,avoid:BRAND.red}[verdict];

  const roiRows = Array.from({length:10},(_,i)=>{
    const yr=i+1,rent=monthlyRent*Math.pow(1+rentalGrowthRate/100,yr);
    const vD=rent*(voidRate/100),eR=rent-vD;
    const mg=eR*(managementRate/100),ma=eR*(maintenanceRate/100),ins=insurance/12;
    const yrNetCF=eR-monthlyMortgage-mg-ma-ins,yrAnnual=yrNetCF*12;
    const propVal=refinanceValue*Math.pow(1+annualGrowthRate/100,yr),equity=propVal-refiMortgage;
    return {yr,rent,yrNetCF,yrAnnual,propVal,equity};
  });
  let rc=0;
  const roiRowsFull=roiRows.map(r=>{rc+=r.yrAnnual;return{...r,cumCash:rc,totalRet:r.equity-netCashIn+rc};});
  const lastRow=roiRowsFull[9];
  const roi10=netCashIn>0?(lastRow.totalRet/netCashIn)*100:Infinity;
  const ann10=netCashIn>0?(Math.pow(1+lastRow.totalRet/netCashIn,1/10)-1)*100:Infinity;
  const leveragedGain=lastRow.propVal-refinanceValue;

  const exportPDF = () => {
    const html = buildPDFHTML({
      propertyName,propertyAddress,notes,
      purchasePrice,purchaseLTV,legalCosts,surveyFee,sdlt,
      purchaseDeposit,purchaseMortgage,totalCashIn,
      refurbCost,refurbWeeks,refurbVoidCost,
      monthlyRent,rentalGrowthRate,voidRate,managementRate,maintenanceRate,insurance,
      refinanceValue,refinanceLTV,interestRate,refinanceFee,
      refiMortgage,monthlyMortgage,capitalRecycled,netCashIn,fullyRecycled,
      voidDeduction,effectiveRent,monthlyMgmt,monthlyMaint,monthlyInsurance,
      netBeforeContingency,netAfterContingency,
      grossYield,netYield,cashOnCash,valueAdd,recycleRate,dealROI,icr,
      hurdleValues,passCount,goodCount,
      verdict,verdictLabel,verdictColor,
      annualGrowthRate,roiRowsFull,lastRow,roi10,ann10,leveragedGain,
    });
    const blob = new Blob([html], {type:"text/html"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.target   = "_blank";
    a.rel      = "noopener noreferrer";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  };

  return (
    <div style={{minHeight:"100vh",background:BRAND.bg,color:BRAND.text,fontFamily:"'DM Sans',sans-serif",maxWidth:"100vw",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=range]{-webkit-appearance:none;background:rgba(255,255,255,0.09);border-radius:6px;height:6px;width:100%}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#C9A96E;cursor:pointer;box-shadow:0 0 10px rgba(201,169,110,0.5);border:2px solid #07111a}
        input[type=text],textarea{background:rgba(255,255,255,0.05);border:1px solid rgba(201,169,110,0.25);border-radius:8px;color:#f0ede8;padding:0.6rem 0.8rem;width:100%;font-family:'DM Sans',sans-serif;font-size:0.9rem;outline:none}
        input[type=text]:focus,textarea:focus{border-color:#C9A96E}
        textarea{resize:vertical;min-height:80px}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.2);border-radius:4px}
        .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(180deg,#0d1f2e 0%,#09151f 100%)",borderBottom:`1px solid ${BRAND.border}`,padding:"1.1rem 1.2rem 0.9rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.6rem"}}>
          <div style={{width:"38px",height:"38px",borderRadius:"8px",background:"linear-gradient(135deg,#1a2e40,#0d1f2e)",border:`1px solid ${BRAND.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"0.85rem",color:BRAND.gold}}>NB</span>
          </div>
          <div>
            <div style={{fontSize:"0.62rem",color:BRAND.gold,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",lineHeight:1}}>Nelson Brierley Properties Limited</div>
            <div style={{fontSize:"1.15rem",fontWeight:700,color:BRAND.text,letterSpacing:"-0.02em",lineHeight:1.2,marginTop:"0.2rem"}}>BRR Analyser</div>
          </div>
          <div style={{marginLeft:"auto",background:"rgba(255,255,255,0.04)",border:`1px solid ${goodCount>=5?BRAND.green+"44":BRAND.amber+"44"}`,borderRadius:"20px",padding:"0.3rem 0.7rem"}}>
            <span style={{fontSize:"0.65rem",fontFamily:"'Space Mono',monospace",color:goodCount>=5?BRAND.green:BRAND.amber}}>{goodCount}/{HURDLES.length} hurdles</span>
          </div>
        </div>
        <div style={{display:"flex",gap:"0.3rem",overflowX:"auto",paddingBottom:"0.1rem"}}>
          {PHASES.map((p,i)=>(
            <div key={p} style={{padding:"0.22rem 0.65rem",borderRadius:"20px",fontSize:"0.65rem",fontFamily:"'Space Mono',monospace",background:"rgba(201,169,110,0.08)",border:`1px solid ${BRAND.goldDim}`,color:BRAND.gold,whiteSpace:"nowrap",display:"flex",gap:"0.3rem"}}>
              <span style={{opacity:0.4}}>{i+1}</span>{p}
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:BRAND.bgDeep,borderBottom:`1px solid ${BRAND.borderFaint}`,position:"sticky",top:0,zIndex:20}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"0.8rem 0.2rem",border:"none",background:"transparent",cursor:"pointer",fontSize:"0.72rem",fontFamily:"'Space Mono',monospace",letterSpacing:"0.04em",color:tab===t.id?BRAND.gold:BRAND.textDim,borderBottom:tab===t.id?`2px solid ${BRAND.gold}`:"2px solid transparent",transition:"all 0.18s"}}>{t.label}</button>
        ))}
      </div>

      <div style={{padding:"1.2rem 1.1rem 6rem"}}>

        {/* INPUTS */}
        {tab==="inputs" && <>
          <SecHead title="Project Details" />
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"0.72rem",color:BRAND.textMid,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:"0.4rem"}}>Property Name / Reference</div>
            <input type="text" value={propertyName} onChange={e=>setPropertyName(e.target.value)} placeholder="e.g. 14 Cavendish Road, Bradford"/>
          </div>
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"0.72rem",color:BRAND.textMid,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:"0.4rem"}}>Full Address (optional)</div>
            <input type="text" value={propertyAddress} onChange={e=>setPropertyAddress(e.target.value)} placeholder="Street, City, Postcode"/>
          </div>
          <div style={{marginBottom:"1.5rem"}}>
            <div style={{fontSize:"0.72rem",color:BRAND.textMid,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:"0.4rem"}}>Notes (appears on report)</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Vendor motivation, comparable rents, strategy notes..."/>
          </div>

          <SecHead title="① Buy" />
          <Slider label="Purchase Price"  value={purchasePrice}  setValue={setPurchasePrice}  min={50000} max={300000} step={1000}  prefix="£" hint="Target BMV — 15–20% below market"/>
          <Slider label="Purchase LTV"    value={purchaseLTV}    setValue={setPurchaseLTV}    min={0}     max={75}     step={5}      suffix="%"  hint="Bridging or BTL mortgage at acquisition"/>
          <Slider label="Legal Costs"     value={legalCosts}     setValue={setLegalCosts}     min={1500}  max={5000}   step={250}    prefix="£"/>
          <Slider label="Survey Fee"      value={surveyFee}      setValue={setSurveyFee}      min={0}     max={1500}   step={50}     prefix="£"  hint="Set to £0 if waiving survey"/>
          <div style={{background:"rgba(201,169,110,0.06)",border:`1px solid ${BRAND.border}`,borderRadius:"10px",padding:"0.85rem 1rem",marginBottom:"1.5rem"}}>
            <div style={{fontSize:"0.62rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.3rem"}}>SDLT — Ltd Co. 5% Surcharge</div>
            <div style={{fontSize:"1.1rem",color:BRAND.gold,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{fmt(sdlt)}</div>
          </div>

          <SecHead title="② Refurb" />
          <Slider label="Refurb Budget"    value={refurbCost}  setValue={setRefurbCost}  min={3000} max={80000} step={1000} prefix="£"     hint="Add 15–20% contingency"/>
          <Slider label="Duration (weeks)" value={refurbWeeks} setValue={setRefurbWeeks} min={1}    max={32}    step={1}    suffix=" wks"  hint="Property earns nothing during this period"/>

          <SecHead title="③ Rent" />
          <Slider label="Monthly Rent"        value={monthlyRent}       setValue={setMonthlyRent}       min={400} max={2000} step={25}  prefix="£" hint="Verify with 3 local agents"/>
          <Slider label="Rental Growth (YoY)" value={rentalGrowthRate}  setValue={setRentalGrowthRate}  min={0}   max={8}    step={0.5} suffix="%" hint="W. Yorkshire avg ~2–3% per year"/>
          <Slider label="Void Allowance"      value={voidRate}          setValue={setVoidRate}          min={0}   max={20}   step={1}   suffix="%" hint="Contingency — shown separately"/>
          <Slider label="Management Fee"      value={managementRate}    setValue={setManagementRate}    min={0}   max={20}   step={1}   suffix="%"/>
          <Slider label="Maintenance Reserve" value={maintenanceRate}   setValue={setMaintenanceRate}   min={3}   max={15}   step={1}   suffix="%" hint="Contingency — shown separately"/>
          <Slider label="Annual Insurance"    value={insurance}         setValue={setInsurance}         min={100} max={2500} step={50}  prefix="£"/>

          <SecHead title="④ Refinance" />
          <Slider label="Projected GDV"  value={refinanceValue} setValue={setRefinanceValue} min={purchasePrice} max={purchasePrice+refurbCost+120000} step={5000} prefix="£" hint="Get 3 valuations post-refurb"/>
          <Slider label="Refinance LTV"  value={refinanceLTV}   setValue={setRefinanceLTV}   min={60}            max={80}                            step={5}     suffix="%" hint="Most BTL lenders cap at 75%"/>
          <Slider label="Interest Rate"  value={interestRate}   setValue={setInterestRate}   min={3}             max={9}                             step={0.1}   suffix="%"/>
          <Slider label="Refinance Fee"  value={refinanceFee}   setValue={setRefinanceFee}   min={0}             max={4000}                          step={100}   prefix="£"/>

          <SecHead title="⑤ ROI Assumptions" />
          <Slider label="Annual Capital Growth" value={annualGrowthRate} setValue={setAnnualGrowthRate} min={0} max={8} step={0.5} suffix="%" hint="W. Yorkshire avg ~3–4% long term"/>
          <div style={{background:"rgba(201,169,110,0.05)",border:`1px solid ${BRAND.goldDim}`,borderRadius:"10px",padding:"0.8rem 1rem",marginBottom:"1.5rem",fontSize:"0.72rem",color:BRAND.textMid,lineHeight:1.6}}>
            ROI shown across a <strong style={{color:BRAND.gold}}>fixed 10-year horizon</strong> with rental growth of <strong style={{color:BRAND.gold}}>{rentalGrowthRate}%/yr</strong> applied.
          </div>

          <button onClick={()=>setTab("results")} style={{width:"100%",padding:"1rem",background:BRAND.gold,border:"none",borderRadius:"12px",color:"#07111a",fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"0.85rem",cursor:"pointer",letterSpacing:"0.06em"}}>
            VIEW RESULTS →
          </button>
        </>}

        {/* RESULTS */}
        {tab==="results" && <>
          <div style={{background:`${verdictColor}11`,border:`2px solid ${verdictColor}`,borderRadius:"14px",padding:"1.1rem 1.2rem",marginBottom:"1.2rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>Deal Verdict</div>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:verdictColor,fontFamily:"'Space Mono',monospace"}}>{verdictLabel}</div>
                {fullyRecycled&&<div style={{fontSize:"0.68rem",color:BRAND.green,marginTop:"0.25rem"}}>✓ Full capital recycle achieved</div>}
                {propertyName&&<div style={{fontSize:"0.72rem",color:BRAND.textMid,marginTop:"0.3rem",fontStyle:"italic"}}>{propertyName}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"0.2rem"}}>Net / Month</div>
                <div style={{fontSize:"1.8rem",fontWeight:700,color:netCashflow>0?verdictColor:BRAND.red,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{fmt(netCashflow)}</div>
              </div>
            </div>
          </div>

          <SecHead title="Cashflow Summary"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem",marginBottom:"1rem"}}>
            <div style={{background:"rgba(74,222,128,0.06)",border:`1px solid ${BRAND.green}44`,borderRadius:"12px",padding:"1rem 1.1rem"}}>
              <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.35rem"}}>Excl. Contingencies</div>
              <div style={{fontSize:"1.3rem",fontWeight:700,color:BRAND.green,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{fmt(netBeforeContingency)}/mo</div>
              <div style={{fontSize:"0.65rem",color:BRAND.textDim,marginTop:"0.3rem"}}>Before void & maintenance</div>
            </div>
            <div style={{background:netAfterContingency>=200?"rgba(74,222,128,0.06)":"rgba(251,191,36,0.06)",border:`1px solid ${netAfterContingency>=200?BRAND.green:BRAND.amber}44`,borderRadius:"12px",padding:"1rem 1.1rem"}}>
              <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.35rem"}}>Incl. Contingencies</div>
              <div style={{fontSize:"1.3rem",fontWeight:700,color:netAfterContingency>=200?BRAND.green:BRAND.amber,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{fmt(netAfterContingency)}/mo</div>
              <div style={{fontSize:"0.65rem",color:BRAND.textDim,marginTop:"0.3rem"}}>After void & maintenance</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${BRAND.borderFaint}`,borderRadius:"12px",padding:"0.8rem 1rem"}}>
              <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.25rem"}}>Void Reserve /mo</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:BRAND.amber,fontFamily:"'Space Mono',monospace"}}>{fmt(voidDeduction)}</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${BRAND.borderFaint}`,borderRadius:"12px",padding:"0.8rem 1rem"}}>
              <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.25rem"}}>Maint. Reserve /mo</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:BRAND.amber,fontFamily:"'Space Mono',monospace"}}>{fmt(monthlyMaint)}</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem",marginBottom:"0.5rem"}}>
            <Card label="Total Cash In"    value={fmt(totalCashIn)}                sub="Before refinance"        dim/>
            <Card label="Capital Recycled" value={fmt(Math.max(0,capitalRecycled))} sub={`${Math.min(100,Math.round(recycleRate))}% back out`} color={recycleRate>=85?BRAND.green:recycleRate>=60?BRAND.gold:BRAND.red}/>
            <Card label="Net Cash Left In" value={netCashIn<=0?"£0 ✓":fmt(netCashIn)} sub="Tied up permanently"  color={netCashIn<=0?BRAND.green:BRAND.text} dim={netCashIn>0}/>
            <Card label="Equity Created"   value={fmt(Math.max(0,valueAdd))}        sub="GDV − purchase − refurb" color={valueAdd>=25000?BRAND.green:valueAdd>=10000?BRAND.amber:BRAND.red}/>
            <Card label="Gross Yield"      value={fmtPct(grossYield)}                sub="On GDV"                  color={grossYield>=8?BRAND.green:grossYield>=6?BRAND.amber:BRAND.red} dim/>
            <Card label="ICR"              value={fmtPct(icr)}                       sub="Lender min: 125%"        color={icr>=145?BRAND.green:icr>=125?BRAND.amber:BRAND.red} dim/>
          </div>

          <SecHead title="Capital Stack"/>
          <div style={{background:BRAND.bgCard,border:`1px solid ${BRAND.borderFaint}`,borderRadius:"12px",padding:"1rem 1.1rem",marginBottom:"0.5rem"}}>
            <Row label="Purchase Deposit"         value={fmt(purchaseDeposit)}/>
            <Row label="SDLT (Ltd Co.)"           value={fmt(sdlt)}/>
            <Row label="Legal Costs"              value={fmt(legalCosts)}/>
            {surveyFee>0&&<Row label="Survey Fee" value={fmt(surveyFee)}/>}
            <Row label="Refurb Budget"            value={fmt(refurbCost)}/>
            <Row label="Total Cash In"            value={fmt(totalCashIn)}                             color={BRAND.gold} bold/>
            <div style={{height:"1px",background:BRAND.borderFaint,margin:"0.6rem 0"}}/>
            <Row label="Refinance Mortgage"       value={fmt(refiMortgage)}/>
            <Row label="Less: Purchase Mortgage"  value={`-${fmt(purchaseMortgage)}`}/>
            <Row label="Refinance Fee"            value={`-${fmt(refinanceFee)}`}/>
            <Row label="Net Capital Recycled"     value={fmt(Math.max(0,capitalRecycled-refinanceFee))} color={BRAND.green} bold/>
            <div style={{height:"1px",background:BRAND.goldDim,margin:"0.6rem 0"}}/>
            <Row label="Cash Permanently Tied Up" value={netCashIn<=0?"£0":fmt(netCashIn)} color={netCashIn<=0?BRAND.green:BRAND.text} bold border={false}/>
          </div>

          <SecHead title="Monthly Cashflow — Post Refi"/>
          <div style={{background:BRAND.bgCard,border:`1px solid ${BRAND.borderFaint}`,borderRadius:"12px",padding:"1rem 1.1rem",marginBottom:"0.5rem"}}>
            <Row label="Gross Rent"                       value={fmt(monthlyRent)}            color={BRAND.text}/>
            <Row label="Mortgage (IO)"                    value={`-${fmt(monthlyMortgage)}`}  color={BRAND.red}/>
            <Row label={`Management (${managementRate}%)`} value={`-${fmt(monthlyMgmt)}`}     color={BRAND.red}/>
            <Row label="Insurance"                        value={`-${fmt(monthlyInsurance)}`} color={BRAND.red}/>
            <Row label="Net (excl. contingencies)"        value={fmt(netBeforeContingency)}    color={BRAND.green} bold/>
            <div style={{margin:"0.5rem 0 0.3rem",padding:"0.4rem 0.7rem",background:"rgba(251,191,36,0.05)",border:`1px solid ${BRAND.amber}22`,borderRadius:"8px"}}>
              <div style={{fontSize:"0.6rem",color:BRAND.amber,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.3rem"}}>Contingency Reserves</div>
              <Row label={`Void reserve (${voidRate}%)`}               value={`-${fmt(voidDeduction)}`} color={BRAND.amber} indent border={false}/>
              <Row label={`Maintenance reserve (${maintenanceRate}%)`}  value={`-${fmt(monthlyMaint)}`}  color={BRAND.amber} indent border={false}/>
            </div>
            <Row label="Net (incl. contingencies)" value={fmt(netAfterContingency)} color={netAfterContingency>=200?BRAND.green:BRAND.amber} bold border={false}/>
          </div>

          <SecHead title="Refurb Reality Check"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem",marginBottom:"0.5rem"}}>
            <Card label="Duration"  value={`${refurbWeeks} wks`} sub="Zero income period" dim color={BRAND.text}/>
            <Card label="Lost Rent" value={fmt(refurbVoidCost)}   sub="During works"       dim color={BRAND.amber}/>
          </div>

          <SecHead title="⑤ Repeat — Reinvestment"/>
          <div style={{background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.12)",borderRadius:"12px",padding:"1rem 1.1rem",marginBottom:"1.5rem"}}>
            <Row label="Capital to Redeploy"      value={capitalRecycled>0?fmt(capitalRecycled):"£0"} color={capitalRecycled>0?BRAND.green:BRAND.red}/>
            <Row label="Enough for Next Deposit?" value={capitalRecycled>=25000?"✓ Yes":capitalRecycled>=15000?"~ Partial":"✗ Not yet"} color={capitalRecycled>=25000?BRAND.green:capitalRecycled>=15000?BRAND.amber:BRAND.red}/>
            <Row label="Deals Fundable"           value={capitalRecycled>=25000?`~${Math.floor(capitalRecycled/30000)} deal(s)`:"—"} border={false}/>
          </div>

          <button onClick={exportPDF} style={{width:"100%",padding:"1rem",background:"linear-gradient(135deg,#C9A96E,#e0c48a)",border:"none",borderRadius:"12px",color:"#07111a",fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"0.85rem",cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
            <span>⬇</span> EXPORT PDF REPORT
          </button>
          <div style={{fontSize:"0.68rem",color:BRAND.textDim,textAlign:"center",marginTop:"0.5rem",fontStyle:"italic"}}>
            Opens report in new tab → tap Share → Print → Save as PDF
          </div>
        </>}

        {/* HURDLES */}
        {tab==="hurdles" && <>
          <div style={{fontSize:"0.78rem",color:BRAND.textMid,lineHeight:1.6,marginBottom:"1rem"}}>
            Every deal must clear these thresholds. <span style={{color:BRAND.green}}>Green</span> = strong. <span style={{color:BRAND.amber}}>Amber</span> = marginal. <span style={{color:BRAND.red}}>Red</span> = walk away.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"1.2rem"}}>
            {[["Good ✓",goodCount,BRAND.green],["Marginal",passCount-goodCount,BRAND.amber],["Failed ✗",HURDLES.length-passCount,BRAND.red]].map(([l,v,c])=>(
              <div key={l} style={{background:BRAND.bgCard,border:`1px solid ${c}33`,borderRadius:"10px",padding:"0.7rem 0.5rem",textAlign:"center"}}>
                <div style={{fontSize:"1.4rem",fontWeight:700,color:c,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{v}</div>
                <div style={{fontSize:"0.62rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",marginTop:"0.25rem"}}>{l}</div>
              </div>
            ))}
          </div>
          {HURDLES.map(h=><HurdleBar key={h.key} h={h} val={hurdleValues[h.key]}/>)}
        </>}

        {/* ROI */}
        {tab==="roi" && <>
          <div style={{fontSize:"0.78rem",color:BRAND.textMid,lineHeight:1.6,marginBottom:"1rem"}}>
            Fixed <strong style={{color:BRAND.gold}}>10-year horizon</strong> · Capital growth <strong style={{color:BRAND.gold}}>{annualGrowthRate}%/yr</strong> · Rental growth <strong style={{color:BRAND.gold}}>{rentalGrowthRate}%/yr</strong>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem",marginBottom:"0.5rem"}}>
            {[
              {label:"10-Yr Total ROI",       value:netCashIn<=0?"∞":fmtPct(roi10),     color:roi10>=100||netCashIn<=0?BRAND.green:roi10>=50?BRAND.amber:BRAND.red,      sub:"Return on net cash left in"},
              {label:"Annualised Return",      value:netCashIn<=0?"∞":fmtPct(ann10),     color:ann10>=15||netCashIn<=0?BRAND.green:ann10>=8?BRAND.amber:BRAND.red,        sub:"Year-on-year compounded"},
              {label:"Cumul. Cashflow (10yr)", value:fmt(lastRow.cumCash),                color:BRAND.gold,                                                                sub:`Yr 1 ${fmt(monthlyRent)}/mo → Yr 10 ${fmt(roiRows[9].rent)}/mo`},
              {label:"Capital Growth (10yr)",  value:fmt(leveragedGain),                  color:leveragedGain>0?BRAND.green:BRAND.red,                                     sub:`Leveraged gain on ${fmt(refinanceValue)}`},
            ].map(c=>(
              <div key={c.label} style={{background:BRAND.bgCard,border:`1px solid ${BRAND.border}`,borderRadius:"12px",padding:"1rem 1.1rem"}}>
                <div style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.35rem"}}>{c.label}</div>
                <div style={{fontSize:"1.35rem",fontWeight:700,color:c.color,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{c.value}</div>
                <div style={{fontSize:"0.62rem",color:BRAND.textDim,marginTop:"0.3rem"}}>{c.sub}</div>
              </div>
            ))}
          </div>
          <SecHead title="10-Year Projection"/>
          <div className="tbl-scroll" style={{marginBottom:"0.5rem"}}>
            <div style={{minWidth:"560px",background:BRAND.bgCard,border:`1px solid ${BRAND.borderFaint}`,borderRadius:"12px",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"0.35fr 0.8fr 0.8fr 0.8fr 0.9fr 0.85fr",padding:"0.6rem 0.9rem",borderBottom:`1px solid ${BRAND.borderFaint}`,background:"rgba(0,0,0,0.25)"}}>
                {["Yr","Rent/mo","Property Val","Equity","Cum. Cash","Total Return"].map(h=>(
                  <div key={h} style={{fontSize:"0.55rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>
                ))}
              </div>
              {roiRowsFull.map((r,i)=>(
                <div key={r.yr} style={{display:"grid",gridTemplateColumns:"0.35fr 0.8fr 0.8fr 0.8fr 0.9fr 0.85fr",padding:"0.5rem 0.9rem",borderBottom:i<9?`1px solid ${BRAND.borderFaint}`:"none",background:i%2===1?"rgba(255,255,255,0.01)":"transparent"}}>
                  <div style={{fontSize:"0.75rem",color:BRAND.gold,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{r.yr}</div>
                  <div style={{fontSize:"0.7rem",color:"#8fa8be",fontFamily:"'Space Mono',monospace"}}>{fmt(r.rent)}</div>
                  <div style={{fontSize:"0.7rem",color:"#8fa8be",fontFamily:"'Space Mono',monospace"}}>{fmt(r.propVal)}</div>
                  <div style={{fontSize:"0.7rem",color:"#8fa8be",fontFamily:"'Space Mono',monospace"}}>{fmt(r.equity)}</div>
                  <div style={{fontSize:"0.7rem",color:r.cumCash>0?BRAND.green:BRAND.red,fontFamily:"'Space Mono',monospace"}}>{fmt(r.cumCash)}</div>
                  <div style={{fontSize:"0.7rem",color:r.totalRet>0?BRAND.green:BRAND.red,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{fmt(r.totalRet)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{fontSize:"0.65rem",color:BRAND.textDim,marginBottom:"1rem",fontStyle:"italic"}}>← Swipe to see all columns</div>
          <SecHead title="Return Attribution (Year 10)"/>
          <div style={{background:BRAND.bgCard,border:`1px solid ${BRAND.borderFaint}`,borderRadius:"12px",padding:"1rem 1.1rem",marginBottom:"1rem"}}>
            <Row label="Equity at Sale (Yr 10)"    value={fmt(lastRow.equity)}    color={BRAND.green}/>
            <Row label="Less: Net Cash Left In"     value={`-${fmt(netCashIn)}`}  color={BRAND.red}/>
            <Row label="Cumulative Cashflow (10yr)" value={fmt(lastRow.cumCash)}  color={BRAND.gold}/>
            <Row label="Total Profit"               value={fmt(lastRow.totalRet)} color={lastRow.totalRet>0?BRAND.green:BRAND.red} bold border={false}/>
          </div>
          <div style={{background:"rgba(201,169,110,0.04)",border:`1px solid ${BRAND.goldDim}`,borderRadius:"10px",padding:"0.9rem 1rem",fontSize:"0.7rem",color:BRAND.textDim,lineHeight:1.7}}>
            <strong style={{color:BRAND.gold}}>Disclaimer:</strong> Projections are illustrative only. Excludes corporation tax, future remortgage costs, and ~2–3% selling costs. Consult your accountant.
          </div>
        </>}

      </div>

      {/* FOOTER */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:BRAND.bgDeep,borderTop:`1px solid ${BRAND.border}`,padding:"0.5rem 1.2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"0.6rem",color:BRAND.textDim,fontFamily:"'Space Mono',monospace"}}>Nelson Brierley Properties Ltd</span>
        <button onClick={exportPDF} style={{background:BRAND.gold,border:"none",borderRadius:"8px",padding:"0.35rem 0.9rem",color:"#07111a",fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"0.62rem",cursor:"pointer",letterSpacing:"0.05em"}}>⬇ PDF</button>
      </div>
    </div>
  );
}
