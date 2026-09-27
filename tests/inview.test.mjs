/* Tests the REAL enough() out of src/hooks/useInView.js.
   The body is lifted straight from the file at run time, so this test
   cannot drift away from the shipped code: if the function is renamed
   or its shape changes, the extraction fails and the test fails.      */
import { readFileSync } from 'node:fs';

const src = readFileSync('src/hooks/useInView.js', 'utf8');
const m = src.match(/const enough = \(\) => \{([\s\S]*?)\n    \};/);
if (!m) { console.error('FAIL: could not find enough() in useInView.js'); process.exit(1); }

/* eslint-disable no-new-func */
const make = (rect, vh, threshold, enter) => {
  const el = { getBoundingClientRect: () => rect };
  const win = { innerHeight: vh };
  const doc = { documentElement: { clientHeight: vh } };
  return new Function('el', 'window', 'document', 'threshold', 'enter',
    `const enough = () => {${m[1]}\n}; return enough();`)(el, win, doc, threshold, enter);
};
const R = (top, height) => ({ top, height, bottom: top + height, width: 800 });

const VH = 900;
let fail = 0;
const t = (name, got, want) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  → ${got} (want ${want})`);
};

console.log('── THE BUG THAT MADE BRIGHT MODE A WHITE PAGE ──');
t('scrolled clean past (bottom -500)      ', make(R(-1100, 600), VH, 0.18, 0.92), true);
t('bottom exactly at 0                    ', make(R(-600, 600), VH, 0.18, 0.92), true);
t('exiting, 1px left at the top           ', make(R(-599, 600), VH, 0.18, 0.92), true);
t('exiting, 50px left — the old sooraakh  ', make(R(-550, 600), VH, 0.18, 0.92), true);
t('top exactly at 0                       ', make(R(0, 600), VH, 0.18, 0.92), true);
t('tall section filling the screen        ', make(R(-200, 4000), VH, 0.18, 0.92), true);

console.log('\n── NORMAL ENTRY, UNCHANGED BEHAVIOUR ──');
t('still below the fold                   ', make(R(950, 600), VH, 0.18, 0.92), false);
t('top at 95% of the screen (past enter)  ', make(R(855, 600), VH, 0.18, 0.92), false);
t('top at 91% — inside enter, too little  ', make(R(819, 600), VH, 0.18, 0.92), false);
t('halfway up, 450px on screen            ', make(R(450, 600), VH, 0.18, 0.92), true);
t('dead centre                            ', make(R(150, 600), VH, 0.18, 0.92), true);

console.log('\n── THE BRIDAL PLATE: enter=0.62 HOLDS IT BACK ──');
t('plate top at 80% — must NOT fire yet   ', make(R(720, 620), VH, 0.26, 0.62), false);
t('plate top at 63% — still not           ', make(R(567, 620), VH, 0.26, 0.62), false);
t('plate top at 50% — now it fires        ', make(R(450, 620), VH, 0.26, 0.62), true);
t('plate scrolled past still fires        ', make(R(-900, 620), VH, 0.26, 0.62), true);

console.log('\n── DEFENSIVE ──');
t('not laid out yet (0x0)                 ', make({ top: 0, height: 0, bottom: 0, width: 0 }, VH, 0.18, 0.92), false);
t('no viewport height known               ', make(R(450, 600), 0, 0.18, 0.92), true);
t('taller than the screen, 16% rule       ', make(R(700, 4000), VH, 0.18, 0.92), true);

console.log(fail ? `\n${fail} FAILED` : '\nall passed');
process.exit(fail ? 1 : 0);
