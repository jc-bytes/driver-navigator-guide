"use client";

import { useEffect, useState, type ReactNode } from "react";

type RoundProps = {
  driver: string;
  navigator: string;
  onBack: () => void;
  onDone: () => void;
  timeUpAction: string;
};

function useCountdown(totalSeconds: number) {
  const [deadline] = useState(() => Date.now() + totalSeconds * 1000);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    function update() {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }

    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return secondsLeft;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const checks = [
  "The Driver showed one sprite.",
  "The Driver named its key: D, F, J, or K.",
  "The Driver said what the sprite does.",
  "We ran the game and watched what happened.",
];

function RoleBadge({ job, student }: { job: "Driver" | "Navigator"; student: string }) {
  return (
    <div className={`role-card ${job.toLowerCase()}`}>
      <span className="role-letter" aria-hidden="true">{job[0]}</span>
      <div>
        <p>{student}</p>
        <strong>{job}</strong>
      </div>
    </div>
  );
}

function Round({ driver, navigator, onBack, onDone, timeUpAction }: RoundProps) {
  const [done, setDone] = useState<boolean[]>(checks.map(() => false));
  const [conversationStep, setConversationStep] = useState(0);
  const secondsLeft = useCountdown(4 * 60);
  const allDone = done.every(Boolean);
  const lastStep = conversationStep === 7;
  const timeUp = secondsLeft === 0;

  function toggle(index: number) {
    setDone((current) => current.map((item, i) => (i === index ? !item : item)));
  }

  let currentStep: ReactNode;

  if (conversationStep === 0) {
    currentStep = (
      <div className="speech driver-speech">
        <span>Driver ({driver}) says</span>
        <p>&quot;I am showing Sprite __.&quot;</p>
      </div>
    );
  } else if (conversationStep === 1) {
    currentStep = (
      <div className="speech navigator-speech">
        <span>Navigator ({navigator}) says</span>
        <p>&quot;Okay. Which key does it use?&quot;</p>
      </div>
    );
  } else if (conversationStep === 2) {
    currentStep = (
      <div className="speech driver-speech">
        <span>Driver ({driver}) says</span>
        <p>&quot;It uses the __ key. When I click the green flag, the sprite starts at the top and moves down.&quot;</p>
      </div>
    );
  } else if (conversationStep === 3) {
    currentStep = (
      <div className="speech navigator-speech">
        <span>Navigator ({navigator}) says</span>
        <p>&quot;Let&apos;s test it.&quot;</p>
      </div>
    );
  } else if (conversationStep === 4) {
    currentStep = (
      <div className="action-card">
        <span>Driver ({driver}) does</span>
        <p>Click the green flag. Press the key when the sprite reaches the goal.</p>
      </div>
    );
  } else if (conversationStep === 5) {
    currentStep = (
      <div className="check-card">
        <h2>Navigator ({navigator}) checks</h2>
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
    );
  } else if (conversationStep === 6) {
    currentStep = (
      <div className="speech navigator-speech">
        <span>Navigator ({navigator}) says</span>
        <p>&quot;It works because I saw __.&quot;</p>
        <p className="speech-choice">or &quot;Please check __.&quot;</p>
      </div>
    );
  } else {
    currentStep = (
      <div className="speech driver-speech">
        <span>Driver ({driver}) says</span>
        <p>&quot;Thank you for checking. I am ready to switch.&quot;</p>
      </div>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <span className="eyebrow">Your turn</span>
        <div className="topbar-status">
          <span className="time-chip">Step {conversationStep + 1} of 8</span>
          <span className={`timer-chip ${secondsLeft <= 30 ? "urgent" : ""}`} aria-label={`${secondsLeft} seconds remaining`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      </header>

      <section className="panel">
        <h1>Show one small part</h1>
        <p className="lead">You are not checking the whole game. One sprite is enough.</p>

        {timeUp ? (
          <div className="time-up-card" role="alert">
            <span>Time is up</span>
            <h2>Stop this turn.</h2>
            <p>Finish the sentence you are saying. Then continue.</p>
            <button className="button primary large" onClick={onDone}>{timeUpAction}</button>
          </div>
        ) : (
          <>
            <div className="role-grid">
              <RoleBadge job="Driver" student={driver} />
              <RoleBadge job="Navigator" student={navigator} />
            </div>

            <div className="conversation-stepper" aria-live="polite">
              <p className="step-instruction">Read or do this step. Then choose Next.</p>
              {currentStep}
            </div>

            <div className="actions">
              <button className="button secondary" onClick={() => conversationStep > 0 ? setConversationStep((step) => step - 1) : onBack()}>Back</button>
              <button
                className="button primary"
                onClick={() => lastStep ? onDone() : setConversationStep((step) => step + 1)}
                disabled={conversationStep === 5 && !allDone}
              >
                {conversationStep === 5 && !allDone ? "Complete the 4 checks" : lastStep ? "We finished this turn" : "Next"}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

const posterPrompts = [
  {
    question: "1. What are the two jobs?",
    frame: "The Driver ___. The Navigator ___.",
    helpful: "The Driver controls the computer and explains. The Navigator watches, asks questions, and checks.",
    avoid: "The Driver drives. The Navigator navigates.",
    reason: "This does not explain the jobs.",
  },
  {
    question: "2. How did you respond to feedback?",
    frame: "My partner told me ___. I ___.",
    helpful: "My partner told me to check the D key. I checked it and tested the game again.",
    avoid: "I said okay.",
    reason: "This does not say what the feedback was or what you did.",
  },
  {
    question: "3. How did you work together?",
    frame: "We worked together by ___.",
    helpful: "We took turns, listened to each other, and tested the sprite together.",
    avoid: "We worked together.",
    reason: "This does not explain how you worked together.",
  },
];

function Poster({ onDone }: { onDone: () => void }) {
  const [answers, setAnswers] = useState(["", "", ""]);
  const secondsLeft = useCountdown(5 * 60);
  const timeUp = secondsLeft === 0;
  const answered = answers.every((answer) => answer.trim().length > 2);

  return (
    <main className="shell">
      <header className="topbar">
        <span className="eyebrow">Poster time</span>
        <span className={`timer-chip ${secondsLeft <= 30 ? "urgent" : ""}`} aria-label={`${secondsLeft} seconds remaining`}>
          {formatTime(secondsLeft)}
        </span>
      </header>
      <section className="panel reflection-panel">
        <h1>Make your teamwork poster</h1>
        <p className="lead">You have 5 minutes. Use these answers on your poster.</p>

        {timeUp ? (
          <div className="time-up-card" role="alert">
            <span>Time is up</span>
            <h2>Put your pencil or keyboard down.</h2>
            <p>Show your poster to your teacher.</p>
            <button className="button primary large" onClick={onDone}>Finish</button>
          </div>
        ) : (
          <>
            <div className="questions">
              {posterPrompts.map((prompt, index) => (
                <article className="question" key={prompt.question}>
                  <label htmlFor={`poster-answer-${index}`}>
                    <strong>{prompt.question}</strong>
                    <span className="sentence-frame">Start like this: {prompt.frame}</span>
                  </label>
                  <div className="helper-grid">
                    <div className="helpful-example">
                      <strong>Helpful example. Change the details.</strong>
                      <p>{prompt.helpful}</p>
                    </div>
                    <div className="avoid-example">
                      <strong>DO NOT USE THIS</strong>
                      <p>{prompt.avoid}</p>
                      <small>{prompt.reason}</small>
                    </div>
                  </div>
                  <textarea
                    id={`poster-answer-${index}`}
                    value={answers[index]}
                    onChange={(event) => setAnswers((current) => current.map((answer, i) => i === index ? event.target.value : answer))}
                    rows={2}
                    placeholder="Write your own answer"
                  />
                </article>
              ))}
            </div>
            <div className="actions poster-actions">
              <span className="finish-hint">Finish early only after answering all 3 questions.</span>
              <button className="button primary" onClick={onDone} disabled={!answered}>
                {answered ? "Finish poster" : "Answer all 3 questions"}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function Home() {
  const [screen, setScreen] = useState(0);
  const [exampleStep, setExampleStep] = useState(0);
  const [student1, setStudent1] = useState("");
  const [student2, setStudent2] = useState("");
  const namesReady = student1.trim().length > 0 && student2.trim().length > 0;

  if (screen === 1) {
    const exampleLines = [
      { role: "driver", label: `Driver (${student1}) says`, text: "I am showing Sprite 1." },
      { role: "navigator", label: `Navigator (${student2}) says`, text: "Okay. Which key does it use?" },
      { role: "driver", label: `Driver (${student1}) says`, text: "It uses the D key. When I click the green flag, the sprite starts at the top and moves down." },
      { role: "navigator", label: `Navigator (${student2}) says`, text: "Let's test it." },
      { role: "driver", label: `Driver (${student1}) says`, text: "I clicked the green flag. Sprite 1 moved down. I pressed D at the goal, and the score went up by 1." },
      { role: "navigator", label: `Navigator (${student2}) says`, text: "It works because I saw the sprite move and the score change." },
      { role: "driver", label: `Driver (${student1}) says`, text: "Thank you for checking. I am ready to switch." },
    ];
    const example = exampleLines[exampleStep];
    const exampleFinished = exampleStep === exampleLines.length - 1;

    return (
      <main className="shell">
        <header className="topbar">
          <span className="eyebrow">Example first</span>
          <span className="time-chip">Step {exampleStep + 1} of {exampleLines.length}</span>
        </header>
        <section className="panel example-panel">
          <h1>Watch how it sounds</h1>
          <p className="lead"><strong>{student1}</strong> is the Driver. <strong>{student2}</strong> is the Navigator.</p>

          <div className="conversation-stepper" aria-live="polite" aria-label="Example conversation between a Driver and Navigator">
            <p className="step-instruction">Read this line aloud. Then choose Next.</p>
            <div className={`speech ${example.role === "driver" ? "driver-speech" : "navigator-speech"}`}>
              <span>{example.label}</span>
              <p>&quot;{example.text}&quot;</p>
            </div>
          </div>

          {exampleFinished && (
            <div className="example-lesson">
              <strong>What made this good?</strong>
              <p>The Driver showed one small part. The Navigator asked one clear question. They tested the game together.</p>
            </div>
          )}

          <div className="actions">
            <button className="button secondary" onClick={() => exampleStep > 0 ? setExampleStep((step) => step - 1) : setScreen(0)}>Back</button>
            <button className="button primary" onClick={() => exampleFinished ? setScreen(2) : setExampleStep((step) => step + 1)}>
              {exampleFinished ? "Now we try it" : "Next"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 2) {
    return <Round driver={student1} navigator={student2} onBack={() => setScreen(1)} onDone={() => setScreen(3)} timeUpAction="Switch roles" />;
  }

  if (screen === 3) {
    return (
      <main className="shell center-screen">
        <section className="panel switch-panel">
          <span className="eyebrow">Stop</span>
          <h1>Switch jobs</h1>
          <div className="switch-visual" aria-label={`${student1} becomes Navigator. ${student2} becomes Driver.`}>
            <RoleBadge job="Navigator" student={student1} />
            <span className="switch-arrow" aria-hidden="true">→</span>
            <RoleBadge job="Driver" student={student2} />
          </div>
          <p className="lead"><strong>{student1}</strong> takes hands off. <strong>{student2}</strong> takes control.</p>
          <div className="actions centered">
            <button className="button secondary" onClick={() => setScreen(2)}>Back</button>
            <button className="button primary" onClick={() => setScreen(4)}>Start {student2}&apos;s turn</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 4) {
    return <Round driver={student2} navigator={student1} onBack={() => setScreen(3)} onDone={() => setScreen(5)} timeUpAction="Go to poster" />;
  }

  if (screen === 5) {
    return <Poster onDone={() => setScreen(6)} />;
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
          <button className="button secondary" onClick={() => { setStudent1(""); setStudent2(""); setExampleStep(0); setScreen(0); }}>
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

        <div className="name-section">
          <h2>Who is working together?</h2>
          <div className="name-form">
            <label className="name-field">
              <span>Student 1 name</span>
              <input
                value={student1}
                onChange={(event) => setStudent1(event.target.value)}
                maxLength={30}
                autoComplete="off"
                placeholder="Type a first name"
              />
            </label>
            <label className="name-field">
              <span>Student 2 name</span>
              <input
                value={student2}
                onChange={(event) => setStudent2(event.target.value)}
                maxLength={30}
                autoComplete="off"
                placeholder="Type a first name"
              />
            </label>
          </div>
          <p className="privacy-note">Your names stay on this page. They are not saved.</p>
        </div>

        <div className="role-grid intro-roles">
          <RoleBadge job="Driver" student="Hands" />
          <RoleBadge job="Navigator" student="Eyes" />
        </div>

        <section className="schedule" aria-labelledby="schedule-title">
          <h2 id="schedule-title">Today&apos;s plan</h2>
          <div className="schedule-grid">
            <div><strong>4:00</strong><span>{student1.trim() || "Student 1"} drives</span></div>
            <div><strong>Switch</strong><span>Change jobs</span></div>
            <div><strong>4:00</strong><span>{student2.trim() || "Student 2"} drives</span></div>
            <div><strong>5:00</strong><span>Make the poster</span></div>
          </div>
        </section>

        <div className="plain-rules">
          <p><strong>The Driver</strong> touches the computer, shows one sprite, and explains it.</p>
          <p><strong>The Navigator</strong> keeps hands off, watches, and gives one helpful sentence.</p>
        </div>

        <div className="one-rule">
          <span>Our one big rule</span>
          <strong>Only the Driver touches the computer.</strong>
        </div>

        <button className="button primary large" onClick={() => setScreen(1)} disabled={!namesReady}>
          {namesReady ? "See a good example" : "Enter both names to begin"}
        </button>
      </section>
    </main>
  );
}
