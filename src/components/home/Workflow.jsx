import ScrollScene from '@/components/motion/ScrollScene';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { WORKFLOW } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE ATELIER WORKFLOW
 *  ─────────────────────────────────────────────────────────────
 *  A vertical rule runs down the left edge and fills with gold as
 *  you scroll — its height is `--p`, the section's own scroll
 *  progress. Each step's node lights up as it enters view, so the
 *  line appears to be "reaching" each stage in turn.
 *
 *  Two independent signals, one coherent effect: the fill is
 *  scroll-linked, the nodes are viewport-triggered.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Workflow({ steps = WORKFLOW }) {
  return (
    <section className="section band-top" style={{ background: 'var(--ink-2)' }}>
      <div className="container">
        <div className="sec-head">
          <div>
            <Reveal from="none">
              <span className="eyebrow">How it is made</span>
            </Reveal>
            <WordReveal
              as="h2"
              style={{ marginTop: '1rem' }}
              segments={[{ text: 'From bolt' }, { text: 'to box.', em: true }]}
            />
          </div>

          <Reveal className="sec-side" delay={0.1}>
            <p className="lede">
              Five stages, none of them rushed. This is the same order of work
              whether the piece is a five-thousand-rupee kurta or a formal that
              takes three days of hand embroidery.
            </p>
          </Reveal>
        </div>

        <ScrollScene as="div" className="workflow" mode="cover">
          <span className="workflow-rail" aria-hidden="true" />

          <ol className="workflow-steps">
            {steps.map((step) => (
              <Reveal as="li" className="wstep" key={step.step} y={26}>
                <span className="step-n num" aria-hidden="true">
                  {step.step}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </ScrollScene>
      </div>
    </section>
  );
}
