"use client";

import { useMemo, useState } from "react";

type RoundProps = {
  driver: "Student 1" | "Student 2";
  navigator: "Student 1" | "Student 2";
  onBack: () => void;
  onDone: () => void;
};

const checks = [
  "The Driver showed one Ball sprite.",
  "The Driver named its key: D, F, J, or K.",
  "The Driver said what the ball does.",
  "We ran the game and watched what happened.",
];

function RoleBadge({ role, student }: { role: "Driver" | "Navigator"; student: string }) {
  return (
    <div className={`role-card ${role.toLowerCase()}`}>
      <span className="role-letter" aria-hidden="true">{role[0]}</span>
      <div>
        <p>{student}</p>
        <strong>{role}</strong>
      </div>
    </div>
  );
}

function Round({ driver, navigator, onBack, onDone }: RoundProps) {
  const [done, setDone] = useState<boolean[]>(checks.map(() => false));
  const allDone = done.every(Boolean);

  function toggle(index: number) {
    setDone((current) => current.map((item, i) => (i === index ? !item : item)));
  }

  return (
    <main className="shell">
      <header className="topbar">
        <span className="eyebrow">Your turn</span>
        <span className="time-chip">About 3 minutes</span>
      </header>

      <section className="panel">
        <h1>Show one small part</h1>
        <p className="lead">You are not checking the whole game. One Ball is enough.</p>

        <div className="role-grid">
          <RoleBadge role="Driver" student={driver} />
          <RoleBadge role="Navigator" student={navigator} />
        </div>

        <div className="task-grid">
          <article className="task driver-task">
            <span className="step-number">1</span>
            <div>
              <h2>Driver shows and tells</h2>
              <ol>
                <li>Open one Ball sprite.</li>
                <li>Point to its key.</li>
                <li>Explain what the ball does.</li>
              </ol>
              <div className="say-box">
                <span>Say this</span>
                <p>&quot;This is Ball __. It uses the __ key. When the game starts, it __.&quot;</p>
              </div>
            </div>
          </article>

          <article className="task navigator-task">
            <span className="step-number">2</span>
            <div>
              <h2>Navigator watches and helps</h2>
              <p>Keep your hands off the computer. Say &quot;yes&quot; or &quot;not yet.&quot; The Driver clicks the boxes.</p>
              <div className="checklist">
                {checks.map((label, index) => (
                  <button
                    className={done[index] ? "check checked" : "check"}
                    key={label}
                    onClick={() => toggle(index)}
                    aria-pressed={done[index]}
                  >
                    <span aria-hidden="true">{done[index] ? "✓" : index + 1}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </article>
        </div>

        <div className="feedback-box">
          <strong>Navigator gives one helpful sentence</strong>
          <p>&quot;It works because I saw __.&quot;</p>
          <p>or &quot;Please check __.&quot;</p>
        </div>

        <div className="actions">
          <button className="button secondary" onClick={onBack}>Back</button>
          <button className="button primary" onClick={onDone} disabled={!allDone}>
            {allDone ? "We finished this turn" : "Complete the 4 checks"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [screen, setScreen] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const answered = useMemo(() => answers.every((answer) => answer.trim().length > 2), [answers]);

  if (screen === 1) {
    return (
      <main className="shell">
        <header className="topbar">
          <span className="eyebrow">Example first</span>
          <span className="time-chip">Read it together</span>
        </header>
        <section className="panel example-panel">
          <h1>Watch how it sounds</h1>
          <p className="lead">Student 1 is the Driver. Student 2 is the Navigator.</p>

          <div className="conversation" aria-label="Example conversation between a Driver and Navigator">
            <div className="speech driver-speech">
              <span>Driver</span>
              <p>&quot;I am showing Ball 1.&quot;</p>
            </div>
            <div className="speech navigator-speech">
              <span>Navigator</span>
              <p>&quot;Okay. Which key does it use?&quot;</p>
            </div>
            <div className="speech driver-speech">
              <span>Driver</span>
              <p>&quot;It uses the D key. When I click the green flag, the ball starts at the top and moves down.&quot;</p>
            </div>
            <div className="speech navigator-speech">
              <span>Navigator</span>
              <p>&quot;Let&apos;s test it.&quot;</p>
            </div>
            <div className="speech driver-speech">
              <span>Driver</span>
              <p>&quot;I clicked the green flag. Ball 1 moved down. I pressed D at the goal, and the score went up by 1.&quot;</p>
            </div>
            <div className="speech navigator-speech">
              <span>Navigator</span>
              <p>&quot;It works because I saw the ball move and the score change.&quot;</p>
            </div>
            <div className="speech driver-speech">
              <span>Driver</span>
              <p>&quot;Thank you for checking. I am ready to switch.&quot;</p>
            </div>
          </div>

          <div className="example-lesson">
            <strong>What made this good?</strong>
            <p>The Driver showed one small part. The Navigator asked one clear question. They tested the game together.</p>
          </div>

          <div className="actions">
            <button className="button secondary" onClick={() => setScreen(0)}>Back</button>
            <button className="button primary" onClick={() => setScreen(2)}>Now we try it</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 2) {
    return <Round driver="Student 1" navigator="Student 2" onBack={() => setScreen(1)} onDone={() => setScreen(3)} />;
  }

  if (screen === 3) {
    return (
      <main className="shell center-screen">
        <section className="panel switch-panel">
          <span className="eyebrow">Stop</span>
          <h1>Switch jobs</h1>
          <div className="switch-visual" aria-label="Student 1 becomes Navigator. Student 2 becomes Driver.">
            <RoleBadge role="Navigator" student="Student 1" />
            <span className="switch-arrow" aria-hidden="true">→</span>
            <RoleBadge role="Driver" student="Student 2" />
          </div>
          <p className="lead">Student 1 takes hands off. Student 2 takes control.</p>
          <div className="actions centered">
            <button className="button secondary" onClick={() => setScreen(2)}>Back</button>
            <button className="button primary" onClick={() => setScreen(4)}>Start Student 2&apos;s turn</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 4) {
    return <Round driver="Student 2" navigator="Student 1" onBack={() => setScreen(3)} onDone={() => setScreen(5)} />;
  }

  if (screen === 5) {
    const prompts = [
      ["1. What are the two jobs?", "The Driver ___. The Navigator ___."],
      ["2. How did you respond to feedback?", "My partner told me ___. I ___."],
      ["3. How did you work together?", "We worked together by ___."],
    ];

    return (
      <main className="shell">
        <header className="topbar">
          <span className="eyebrow">Last step</span>
          <span className="time-chip">Answer together</span>
        </header>
        <section className="panel reflection-panel">
          <h1>Think about your teamwork</h1>
          <p className="lead">Talk first. Then type one short answer for each question.</p>
          <div className="questions">
            {prompts.map(([question, frame], index) => (
              <label className="question" key={question}>
                <strong>{question}</strong>
                <span>{frame}</span>
                <textarea
                  value={answers[index]}
                  onChange={(event) => setAnswers((current) => current.map((answer, i) => i === index ? event.target.value : answer))}
                  rows={2}
                  placeholder="Type your answer here"
                />
              </label>
            ))}
          </div>
          <div className="actions">
            <button className="button secondary" onClick={() => setScreen(4)}>Back</button>
            <button className="button primary" onClick={() => setScreen(6)} disabled={!answered}>
              {answered ? "Finish" : "Answer all 3 questions"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 6) {
    return (
      <main className="shell center-screen">
        <section className="panel finish-panel">
          <div className="finish-mark" aria-hidden="true">✓</div>
          <span className="eyebrow">Finished</span>
          <h1>You both did both jobs.</h1>
          <p className="lead">Show this screen to your teacher.</p>
          <div className="mini-summary">
            <p><strong>Driver:</strong> hands, show, explain</p>
            <p><strong>Navigator:</strong> eyes, listen, check</p>
          </div>
          <button className="button secondary" onClick={() => { setAnswers(["", "", ""]); setScreen(0); }}>
            Start again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell center-screen">
      <section className="panel intro-panel">
        <span className="eyebrow">Pair programming</span>
        <h1>One computer. Two helpers.</h1>
        <p className="lead eli5">Think about building with blocks. One person holds the blocks. The other person looks and helps.</p>

        <div className="role-grid intro-roles">
          <RoleBadge role="Driver" student="Hands" />
          <RoleBadge role="Navigator" student="Eyes" />
        </div>

        <div className="plain-rules">
          <p><strong>The Driver</strong> touches the computer, shows one Ball, and explains it.</p>
          <p><strong>The Navigator</strong> keeps hands off, watches, and gives one helpful sentence.</p>
        </div>

        <div className="one-rule">
          <span>Our one big rule</span>
          <strong>Only the Driver touches the computer.</strong>
        </div>

        <button className="button primary large" onClick={() => setScreen(1)}>See a good example</button>
      </section>
    </main>
  );
}
