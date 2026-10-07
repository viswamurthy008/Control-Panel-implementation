// Static fixtures for the simulated floor.

export const ZC = { active:'var(--green-500)', idle:'var(--gray-400)', charging:'var(--blue-500)', fault:'var(--red-500)' };

export const zones = [
  { id:'asm-a', name:'Assembly A', kind:'Assembly line', x:3, y:7, w:26, h:38, color:'var(--blue-500)', n:4 },
  { id:'asm-b', name:'Assembly B', kind:'Assembly line', x:3, y:50, w:26, h:43, color:'var(--blue-500)', n:4 },
  { id:'pick', name:'Pick / Pack', kind:'Warehouse', x:33, y:7, w:33, h:86, color:'var(--green-500)', n:8 },
  { id:'weld', name:'Weld Cells', kind:'Welding', x:70, y:7, w:27, h:40, color:'var(--yellow-500)', n:4 },
  { id:'charge', name:'Charging', kind:'Charge dock', x:70, y:52, w:27, h:17, color:'var(--gray-400)', n:2 },
  { id:'maint', name:'Maintenance', kind:'Service bay', x:70, y:76, w:27, h:17, color:'var(--gray-400)', n:2 },
];

export const taskPool = {
  'asm-a':['Torque fasten side panel','Install wiring loom','Fit door module','Seat dashboard cluster'],
  'asm-b':['QC inspect frame weld','Attach battery tray','Route coolant line','Mount suspension arm'],
  'pick':['Pick order #A-4471','Pack carton — 12 units','Palletize outbound','Replenish bin 34-C','Sort inbound totes','Scan & stow'],
  'weld':['Spot weld B-pillar seam','Weld cross-member bracket','Grind weld flush','Inspect weld porosity'],
  'charge':['Fast charge to 100%','Balancing cells'],
  'maint':['Awaiting diagnostics','Actuator service'],
};

export const models = { 'asm-a':'Vulcan A2', 'asm-b':'Vulcan A2', 'pick':'Kestrel P3', 'weld':'Forge W1', 'charge':'Kestrel P3', 'maint':'Vulcan A2' };

export const plantProfiles = {
  mer4: { idleBias:0.14 },
  mer2: { counts:{'asm-a':3,'asm-b':3,'pick':4,'weld':2,'charge':2,'maint':2}, idleBias:0.22 },
  aur1: { counts:{'asm-a':6,'asm-b':6,'pick':6,'weld':10,'charge':3,'maint':3}, idleBias:0.10 },
  kite: { counts:{'asm-a':2,'asm-b':2,'pick':30,'weld':2,'charge':8,'maint':4}, idleBias:0.16 },
};

export const makePlants = (plantName) => [
  { id:'mer4', name: plantName || 'Meridian — Building 4', line:'Assembly & pick', online:'17/24' },
  { id:'mer2', name:'Meridian — Building 2', line:'Sub-assembly', online:'12/16' },
  { id:'aur1', name:'Aurora — Plant 1', line:'Welding & paint', online:'28/34' },
  { id:'kite', name:'Kite Logistics DC', line:'Warehouse pick/pack', online:'40/48' },
];

export const workOrders = [
  { id:'WO-3391', robot:'HX-224', title:'Replace shoulder actuator', pri:'High', status:'Open', age:'2h', tech:'—' },
  { id:'WO-3388', robot:'HX-231', title:'Recalibrate force-torque sensor', pri:'Medium', status:'In progress', age:'5h', tech:'J. Okafor' },
  { id:'WO-3384', robot:'HX-207', title:'Gripper pad wear — replace', pri:'Medium', status:'Open', age:'9h', tech:'—' },
  { id:'WO-3379', robot:'HX-218', title:'Firmware rollback 4.2.1 → 4.1.9', pri:'Low', status:'In progress', age:'1d', tech:'M. Adeyemi' },
  { id:'WO-3371', robot:'HX-212', title:'Coolant top-up + leak check', pri:'Low', status:'Open', age:'1d', tech:'—' },
];

export const docks = [
  { id:'DK-01', kw:22, type:'Fast' },
  { id:'DK-02', kw:22, type:'Fast' },
  { id:'DK-03', kw:11, type:'Standard' },
  { id:'DK-04', kw:11, type:'Standard' },
  { id:'DK-05', kw:11, type:'Standard' },
  { id:'DK-06', kw:7, type:'Trickle' },
  { id:'DK-07', kw:7, type:'Trickle' },
  { id:'DK-08', kw:22, type:'Fast', offline:true },
];

export const noGoZones = [
  { name:'AGV cross-lane', x:29.5, y:8, w:3, h:85 },
  { name:'HV cabinet — keep out', x:66.5, y:8, w:3, h:39 },
];

export const parts = [
  { sku:'ACT-SH-02', name:'Shoulder actuator', stock:3, min:2, loc:'A-14' },
  { sku:'GRP-PAD-11', name:'Gripper pad set', stock:1, min:4, loc:'B-03' },
  { sku:'FTS-CAL-01', name:'Force-torque sensor', stock:6, min:2, loc:'A-09' },
  { sku:'CLT-2L', name:'Coolant — 2L', stock:12, min:6, loc:'C-21' },
  { sku:'BRG-HIP-04', name:'Hip bearing', stock:0, min:3, loc:'A-17' },
  { sku:'BLT-M8', name:'M8 fastener kit', stock:24, min:10, loc:'D-02' },
];

export const routing = [
  { channel:'Floor console', target:'All operators on shift', sev:['critical','warning','info'] },
  { channel:'Pager — on-call', target:'J. Okafor · maint lead', sev:['critical'] },
  { channel:'Slack #floor-ops', target:'Ops + supervisors', sev:['critical','warning'] },
  { channel:'Email digest', target:'Plant manager', sev:['critical'] },
  { channel:'SMS escalation', target:'Safety officer', sev:['critical'] },
];

export const initialRules = [
  { id:'batt', name:'Low battery', metric:'State of charge', op:'below', value:20, unit:'%', sev:'warning', enabled:true, action:'Auto-dispatch to charge · notify floor lead' },
  { id:'temp', name:'Motor over-temp', metric:'Any joint temp', op:'above', value:55, unit:'°C', sev:'critical', enabled:true, action:'E-stop unit · page on-call tech' },
  { id:'geo', name:'Geofence breach', metric:'Position', op:'enters', value:0, unit:'no-go zone', sev:'critical', enabled:true, action:'Halt unit · notify safety officer' },
  { id:'cycle', name:'Cycle-time drift', metric:'Cycle time', op:'above', value:18, unit:'%', sev:'info', enabled:true, action:'Log for trend analysis' },
  { id:'vibe', name:'Vibration spike', metric:'Actuator vibration', op:'above', value:3, unit:'×base', sev:'warning', enabled:false, action:'Open a work order' },
];

export const jobSeed = [
  ['Palletize outbound — dock 3','Warehouse','High','inprogress',null],
  ['Torque fasten side panel','Assembly A','High','inprogress',null],
  ['Spot weld B-pillar seam','Welding','Medium','inprogress',null],
  ['Pick order #A-4482','Warehouse','Medium','inprogress',null],
  ['QC inspect frame weld','Assembly B','Low','inprogress',null],
  ['Replenish bin 34-C','Warehouse','Medium','queued','—'],
  ['Install wiring loom','Assembly A','High','queued','—'],
  ['Weld cross-member bracket','Welding','Low','queued','—'],
  ['Sort inbound totes','Warehouse','Low','queued','—'],
  ['Mount suspension arm','Assembly B','Medium','blocked','—'],
  ['Route coolant line','Assembly B','High','blocked','—'],
  ['Pack carton — 12 units','Warehouse','Medium','done',null],
  ['Grind weld flush','Welding','Low','done',null],
  ['Fit door module','Assembly A','Medium','done',null],
  ['Scan & stow — aisle 7','Warehouse','Low','done',null],
];
