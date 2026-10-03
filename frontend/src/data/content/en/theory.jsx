/* eslint-disable react-refresh/only-export-components, react/no-unescaped-entities */
export const theory = {
  title: 'How to cleanse your mind in 5 steps',
  subtitle: 'The strategy for reducing your stress in a simple, safe way',
  writtenBy: 'Story by: Marco Ferrani - Detox Mental',
  wantMoreTitle: 'Want more?',
  Body: TheoryBody,
  WantMore: WantMore,
};

function TheoryBody({ writtenBy }) {
  return (
    <>
        <section className="intro-section">
          <p className='intro-section__written-by'><em>{writtenBy}</em></p>
          <p>In early 2020, a battle that had already been going on for months was being fought inside me. My brain, the battlefield, had been infected by a toxic thought — an idea that soon became a trap that does not kill, but does not let go either:</p>
          <blockquote>“What would it feel like to die a painful death?”</blockquote>
          <p className='article__note'><em>Note: this text contains facts, claims, and opinions that may affect some readers. If you consider yourself a sensitive person, we recommend that you refrain from reading it.</em></p>
          <hr className='article__intro-line'></hr>
          <p>After getting through a particularly unpleasant incident, I decided to use my story to share the five-step strategy that got me out of trouble when things started to get ugly.</p>
          <p>After you learn these five steps you will find creative recommendations that will help you begin the process of a mental cleanse. Perhaps an extra surprise as well.</p>
        </section>
        {/* 5 Steps Overview */}
        <section className="steps-overview">
          <h2>The five steps of the strategy are:</h2>
          <ol className="steps-list">
            <li><span className="step-number">1</span> Step back</li>
            <li><span className="step-number">2</span> Recognize</li>
            <li><span className="step-number">3</span> Understand</li>
            <li><span className="step-number">4</span> Arm yourself</li>
            <li><span className="step-number">5</span> Kill</li>
          </ol>
        </section>
        {/* Story and context */}
        <section>
          <h2>The beginning</h2>
          <p>In mid-2019, my brother showed me a video that disturbed me deeply, even though that was not his intention. The video was about a game/simulation in which the protagonist is a person drowning, and the goal is to swim as far as you can before an inevitable death.</p>
          <p>Apparently this game was designed to raise awareness among boat users about wearing life jackets, and after watching it, I can assure you I was made aware <em>effectively</em>.</p>
          <p>The experience is very real. Here is the video so you can see for yourself:</p>
          <iframe
              className='article__youtube-video' 
              width="100%" 
              height="315" 
              src="https://www.youtube.com/embed/olzAKkQMMNc?start=90" 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" >
          </iframe>
          <p>This simulation, which includes hallucinations and the protagonist tearing off a fingernail to stay alert, was too much for me.</p>
          <p>It shook me. For a moment I became that drowning person and felt the desperation they felt. Those images replayed in my mind for longer than they should have, and that night I experienced strange chills that ran through my body from head to toe.</p>
          <p>It was exactly as it sounds: <strong>that video traumatized me.</strong></p>
          <p>My brother, on the other hand, was completely relaxed.</p>
          <p>And why shouldn't he have been? It was just a video.</p>
          <p>That same day we watched another video showing the reaction of several lifeguards to the simulation: they were all shaken, but none of them said <em>“for a moment I became that drowning person and felt the desperation they felt. I am traumatized”</em>.</p>
          <p>No. All of them were fine.</p>
          <p>Why did it affect me so much?</p>
        </section>
        <section>
          <h2>Emotional trauma</h2>
          <p>A few months passed and the video was forgotten. In fact, I watched it again a couple of times to demystify it, and I never again felt what I felt that day with my brother.</p>
          <p>Even so, something was still wrong in my brain. There was a kind of short circuit, and I knew it.</p>
          <p>What had hit me was not the death of the game's protagonist, but the desperation he had experienced just before dying. It was a fictional experience, but a powerful one that marked me emotionally.</p>
          <p>I had already gotten past the event that started it all, but I still felt the chills from that night while I imagined myself in other equally desperate situations:</p>
          <blockquote>«What do the seconds before a fatal traffic accident feel like? That moment when you realize that whatever you are about to hit is inevitable. What goes through your mind when you know you are going to die?»</blockquote>
          <blockquote>«And the impact? What does a blow strong enough to kill you feel like? And if death is not immediate? If you are left suffering for a few minutes before leaving this life? What does a person feel an instant before causing a crash that will cost their whole family their lives? What does that guilt feel like, that desperation? Hearing their screams and being unable to do anything? Looking at them and...?»</blockquote>
          <p className='article__note'>(At this point I could keep going deeper into the dark thoughts I used to have, but to avoid hurting the reader's sensitivity without need, I will cut this exercise here.)</p>
          <p>And they were not only thoughts related to traffic accidents. I also thought about fires, losing an arm or a leg, being crushed, family members dying because of me… You name it, and I have probably already thought about it.</p>
          <p>It was a crazy time, and I know this sounds like a horror story, but it may comfort you to know that these thoughts did not affect me in the slightest.</p>
          <p>I lived through it very calmly, and it was all thanks to something I learned years ago in a book: <a className='article__in-text-link' href='https://www.amazon.es/Una-nueva-tierra-despertar-proposito/dp/9580490619/ref=sr_1_2?crid=3NEOOHKGF6RNV&dib=eyJ2IjoiMSJ9.ynkAFITH8LB5vLo140SslzC4YQiVIEikvxvpzpUNrFUV-N24HnIg3NR21P6agm-bSGy-gmX6lFBppYcAxThqA7uwDwbUOmaBkKLfru16ru1qeFv4ZBz89BjhqtouOaYd1eL2Wx-sDo622cx_2v7Aazx-xcwhiW0UBDgCIVNal1BFqEuYi8nqLQaPctS966r8cCJGi_ppnB7hSb7mHyDqBZROQknUwn_iDuRT6uAQKIjjs4as48_zTf1DqISSWR0FpoKYJcD2QAyc6n4cc12CXOGWlkFHfvJ2gfmfiO_Hy98.4hO1wQdJZJZuSpAwJqMtJBxGphec__dwlxp2wVtH_Lg&dib_tag=se&keywords=una+nueva+tierra+eckhart+tolle&qid=1757848790&sprefix=una+nueva%2Caps%2C60&sr=8-2#' target='_blank' rel='noreferrer'><em>A New Earth</em></a> by Eckhart Tolle.</p>
          <p className='article__note'>Editor's note [1 year and 2 months later]: rereading this, I realize it is unfair to say that only reading this book allowed me to get through the situation. Reading <em>A New Earth</em> was the most important step in this whole process because it opened the doors of the world of the mind for me — it woke my curiosity about it — but after that I became a fanatic of psychology, consciousness, and spirituality, and in recent years I have invested hundreds of hours reading and listening about these topics. The most important of everything I have learned is summarized in the text you are about to read.</p>
          <p>Let's move on to the strategy so I can explain what I did.</p>
        </section>
        {/* Step 1 */}
        <section className="step-section">
          <h3><span className="step-number">1</span> Step back: you are NOT your mind</h3>
          <p>Tolle is better known for his bestseller <a className='article__in-text-link' href='https://www.amazon.es/Poder-Ahora-Gu%C3%ADa-Iluminaci%C3%B3n-Espiritual/dp/8484452069/ref=sr_1_1?crid=1YRUUGWFSRFXB&dib=eyJ2IjoiMSJ9.A1S0FQ7BA1i1zk17ngVEVBGqr9gQWvG2T01DbXqS4JSFhnfqCjbiTdQp10WVHtlhTYrltRQh2DFco8lyEyE1XVy2Zk426lunlDznBlNXni5Pm966eRJv1CPE2v8daChi27m9N5BFW4BofezySgq9s9hdsr5nX4b0bR-2X9vkCizUI9ZKOsyqafiwTc4FWe-DzdYIhEhobGIcDenPP-XgcQcyUy4_msbq2OO-WXRVH8sKaQhXdbaftYNhCt4HTbKS2IuZrWwKicPixE2RVYPoUA_hLllT9nTkntsfioofIvQ.qShOz2VazpNc-PvVcEotwrxCNxHLKQGpgUB59S0agf0&dib_tag=se&keywords=el+poder+del+ahora&qid=1757846421&sprefix=el+poder+del+%2Caps%2C68&sr=8-1' target='_blank' rel='noreferrer'><em>The Power of Now</em></a>, a book famous in every corner of the earth thanks to the way it explains spiritual principles without tying itself to the beliefs of any specific religion.</p>
          <p>Tolle's thesis, summarized (perhaps too summarized), is that we live in a constant state of stress generated by our own thoughts, and if you are reading this in 2025, you must know exactly what he means: that unstoppable voice in your head replaying arguments from the past and inventing the perfect reply you should have said, imagining exciting scenarios for your future, judging all your actions and deciding whether they were right or wrong, remembering old mistakes, listing your partner's flaws… You know, that voice.</p>
          <p>Recognizing it is important; understanding it is <em>crucial.</em></p>
          <p>The trick is to understand that most of the dialogue constantly taking place in our brain is involuntary. You can be brushing your teeth before bed while in your mind an extensive trial is underway, accusing your parents of mistreating you as a child. All against your will, and with little you can do to stop it.</p>
          <p>You may try to think of something less complicated and fail even if you try with all your strength. Changing these inner dialogues is usually quite difficult.</p>
          <p>This is the first truth you must know about thoughts: <strong>you do not control your mind as much as you think.</strong></p>
          <p>In reality, <strong>it is our emotions that control the vast majority of our thoughts,</strong> and although these can be understood and channeled so they do not destroy our mental health, most of us are emotional <em>illiterates</em> and do not know how to do it.</p>
          <p>Schools do not teach how to deal with fury or frustration. Our parents, who were educated in the same system, are usually just as ignorant as we are about the emotional world. On social media, psychology has become very fashionable (something I applaud and support) and every day we have more tools to know ourselves, but unfortunately, it is still not enough to say that humans handle our emotions correctly.</p>
          <p>That is why when we have some incident that makes us angry we end up spending hours thinking not only about that, but about every similar situation that makes us feel equally angry.</p>
          <p>What starts as an argument with a friend becomes a spiral of thoughts that takes you to the injustices you have suffered lately, the living-together problem you are going through right now (which makes you sick just thinking about it), or the rude telemarketer who ruined your afternoon trying to sell you a deceptive phone plan.</p>
          <p>That is how the vicious cycle begins: <strong>the first thought unleashes an emotion, and that emotion attracts other thoughts that keep it alive.</strong></p>
          <p>Meanwhile, we have not even noticed the whole mess that initial argument with our friend unleashed. We do not know how to detect the emotion, much less soothe it, which means we spend an afternoon or even several days wrapped up in the same hole of thoughts that make us angry. This is as common as it is problematic.</p>
          <p>The greatest demonstration that we do not control our mind is meditation.</p>
          <p>Even the most expert meditators have trouble keeping their mind blank despite all the time they dedicate to achieving this «simple» goal.</p>
          <p>How long can you go without thinking about anything at all?</p>
          <p>Try it and you will realize how hard it is.</p>
          <p>Thoughts are almost inevitable: they arrive directly in our mind and we only choose which ones we keep and which ones we do not (I will talk about this later).</p>
          <p>The average person who uses their cell phone daily and does not practice any kind of meditation will be lucky if they can go three seconds without thinking. Three seconds: that is the kind of power we have over the flow of our ideas.</p>
          <p>The good side is that each of us has the power to free ourselves from that state of compulsive thinking if we are willing to blank the mind and focus on the «here and now» — a simple exercise, but one that requires consistency to master.</p>
          <p>Unfortunately, most of us are so used to having our mind occupied that a few minutes without distractions become torture.</p>
          <p>When we try, the most common thing is to feel a slight but constant desperation that we do not know where it comes from. Once you have recognized that you are not your mind and that your thoughts are mostly random, you will start to notice this strange and unpleasant sensation more often.</p>
          <p>That is when you should continue to the second step of the strategy.</p>
        </section>
        {/* Step 2 */}
        <section className="step-section">
          <h3><span className="step-number">2</span> Recognize: your thoughts cannot harm you… If you do not let them</h3>
          <p>Discovering how random thoughts are can be very beneficial if you know what to do with that information.</p>
          <p>When you discover that no matter what you do there will be moments when you have to deal with tormenting thoughts, they stop seeming so dangerous. Little by little they start to make you curious, and in almost 100% of cases they lead to great revelations.</p>
          <p>Tormenting thoughts <strong>can only harm you if you let them stay in your mind longer than they should, or if you avoid them instead of facing them.</strong> Otherwise, they are harmless. That is the lesson that saved me from what could have been a terrible episode of anxiety, depression, or both at once.</p>
          <p>In my case, when the horrible thoughts started arriving, I was already prepared thanks to reading related books and a well-established stillness (meditation) practice. From the first moment I knew that these crazy ideas worrying me were the work of my exaggerated imagination and that I should not make myself miserable over them.</p>
          <p>One of the things I have learned reading writers like Tolle and listening to <a className='article__in-text-link' href='https://www.youtube.com/@Paramitaorg' target='_blank' rel='noreferrer'>spirituality experts</a> is that it does not serve us to take our own thoughts too seriously.</p>
          <p>It is normal to have ideas that embarrass us or that seem horrible to us.</p>
          <p>This is what happens when the McDonald's cashier gives you the wrong ice cream and you automatically think «I hope they die».</p>
          <p>When you come to your senses you realize that was exaggerated. You do not actually want the cashier to die, but now you judge yourself for having thought that way.</p>
          <p>A bad thought does not make you a bad person. We all think crazy things, and <strong>as long as we do not act on them</strong>, there will be no problem. They will still be ideas that passed through our head and then vanished into oblivion.</p>
          <p>Although in my case it was scenarios of painful deaths, tormenting thoughts come in every color and texture you can imagine. Some examples are:</p>
          <ul>
            <li>- Making a mistake and constantly beating yourself up about not being enough.</li>
            <li>- Having “dark thoughts” that normally involve negative and irreversible events (my case).</li>
            <li>- Imagining scenarios where someone who hurt you receives an excessive punishment.</li>
            <li>- Having racist thoughts even though you hate racism.</li>
            <li>- Exaggerating one of your flaws in order to play the victim.</li>
            <li>- Suicidal thoughts.</li>
          </ul>
          <p>The list goes on and on, but in every case, the person who manages to recognize that these thoughts do not define them gets to see them for what they are: ideas that come and go through our brain infinitely and that need our attention in order to survive.</p>
          <p>Which brings us to the third step.</p>
        </section>
        {/* Step 3 */}
        <section className="step-section">
          <h3><span className="step-number">3</span> Understand: How do you kill a thought?</h3>
          <p>Why do tormenting thoughts exist? <strong>What use are they?</strong> Knowing the answer to the question in bold could be all you need to solve each and every one of your personal problems, not only those related to tormenting thoughts.</p>
          <p>Theories based on evolution usually give convincing answers to this kind of important question, and in the case of tormenting thoughts, those theories are so useful they earned a section in this text. If you believe in evolution (or if you do not believe in it but have an open mind), what you are about to read will be key if you truly want to take back control of your mind.</p>
          <h4>What is the use of tormenting thoughts?</h4>
          <p>From an evolutionary point of view, tormenting thoughts represent countless advantages for our species.</p>
          <p>Humans are at the top of the food chain not thanks to our physical strength, but to our intelligence and our ability to worry about things that have not happened yet. Being the most neurotic animals on the planet resulted in a species that can plan its food supply taking into account seasons of drought and rain, that can avoid being hunted by more powerful animals, and that can also leave a particular place if the water reserves seem to be running out. A dog, an elephant, or a lady hippopotamus can develop a certain amount of planning, but never at the level of complexity the human brain is able to handle.</p>
          <p>On the other hand, this level of awareness of every possible scenario has a price: if it is not controlled, it is easy to end up inside an endless loop of worries that lets us survive, but at the same time makes us <em>miserable.</em></p>
          <p>In a modern world where survival is practically guaranteed (food is abundant, water too, the risk of being hunted by other animals is minimal, we have shelter all year, wars are less and less common…), this power to avoid catastrophes has mutated into a constant search to improve our situation no matter how good it already is.</p>
          <p>The worst part is that <a className='article__in-text-link' href='https://es.wikipedia.org/wiki/Adaptaci%C3%B3n_hed%C3%B3nica' target='_blank' rel='noreferrer'>this search for progress seems to be infinite</a>. We do not know how to stop our craving to get more, and those who want to stop it need years of practice to get <em>moderately</em> satisfactory results.</p>
          <p>In short: the vast majority of people living today have no control over the survival machine we have inside our skull, so <strong>the only way to face this problem of compulsive thoughts is to understand it:</strong> if tormenting thoughts are there to help us survive and improve our situation, we must use them in our favor instead of trying to ignore them and hoping they go away on their own, which will rarely happen.</p>
          <p>To achieve this, you will have to do two things:</p>
          <ol>
            <li>Learn to tell valuable tormenting thoughts apart from those motivated only by ego. (For example: living tormented because you do not have enough followers / likes on social media. This is a tormenting thought with no real value unless your life goal is to keep up appearances, and if that is your case, this text will not help you much.)</li>
            <li>Determine what information the valuable tormenting thoughts want to give you — the ones motivated by situations that threaten your safety, happiness, and personal development.</li>
          </ol>
          <p>The first step, learning to tell valuable tormenting thoughts apart from those motivated by ego, will be covered in Detox Mental in the future.</p>
          <p>The second, related to understanding the message of <em>valuable</em> tormenting thoughts, will be discussed right now with an example:</p>
          <p>If you have been tormented for months by problems living with someone, a situation that pounds your peace and calm day after day, you must do everything possible to observe the dialogue inside your head and ask constructive questions that help solve the problem.</p>
          <p>Look at this inner dialogue interrupted by the power of constructive questions:</p>
          <blockquote className='article__internal-dialogue'>
            <strong>You, angry:</strong> «My roommate is the worst! Look what he did this time: the bathroom full of hair after shaving. This guy is disgusting!»<br/><br/>
            <strong>Constructive question:</strong> And why do you live with that person if you find them so disgusting?<br/><br/>
            <strong>You, still angry:</strong> «Because I need him! It is the only way to save money while I stay in this poorly paid job I have. As soon as I get another job I am leaving this house.<br/><br/>
            <strong>Constructive question:</strong> And how long has it been since you did anything productive toward getting that new job?<br/><br/>
            <strong>You, still angry but a little calmer because you are telling yourself the hard truths to your face:</strong> «I have gone a month without looking for anything, but that does not mean I have given up».<br/><br/>
            <strong>Constructive question:</strong> Then, is it worth complaining about something that is also your fault? If you have not done everything you could for your new job, could you at least look for creative ways to talk to your roommate and convince him to be more organized while you are still living with him? If you are only with him because that is how you save money, why not find another roommate to share expenses with who is cleaner?
          </blockquote>
          <p>If you keep this process going long enough (days or weeks), you will end up realizing that your problem is not so much in your roommate as in you — that you have not done enough to change jobs or to mend the relationship with him, which is clearly complicated and requires emotional skills most of us do not have. Your annoyance is more with yourself than with him; you just do not know it.</p>
          <p className='article__note'>Editor's note [4 years later]: ironically, when you start doing 100% of what is within your reach, the annoyance disappears and empathy arises in its place: when you do what you should be doing and realize it is not easy at all, your judgment against other people decreases notably.</p>
          <p>If from that moment you start doing everything possible to strengthen your weak points and act, the problem with your dirty roommate will move to the background and you will be able to focus your energy on what you should be doing instead of complaining.</p>
          <p>The same happens if you are tormented by thoughts related to money, your partner, the situation of your country, or your football team: if you take care of doing your part, the torment decreases.</p>
          <p>Every situation that torments us has a solution, and if we are not creative enough to find it, we will be condemned to a life full of tormenting thoughts.</p>
          <p>That said,</p>
          <h4>How do you kill a tormenting thought?</h4>
          <p>Once you discover your action plan and start working on it, the problem will start to become smaller and more bearable. That is where you must kill your tormenting thought the same way you kill any thought: by starving it.</p>
          <p>Thoughts live on attention. If you do not give any attention to a particular one, it disappears into the infinite flow of ideas that are dying to spend time in your mind.</p>
          <p>This rule applies to both negative and positive thoughts: <strong>great torments die the same way great ideas do if they are not fed with our valuable and limited attention.</strong></p>
          <p>If you already understand the problem and know the tactic for killing your tormenting thoughts, it is time to take the next step: arm yourself with a tool that lets you control your attention and thus deny it to the thoughts you want to eliminate.</p>
        </section>
        {/* Step 4 */}
        <section className="step-section">
          <h3><span className="step-number">4</span> Arm yourself: stillness as a way to regulate your attention</h3>
          <p>One of the worst pieces of advice in the world is the typical «just don't think about it».</p>
          <p>It is easy for everyone to tell someone else to «think about something else» when we are not the ones going through their situation. This usually gives terrible results.</p>
          <p>Much more effective would be trying to change your emotional state so that little by little you start attracting other thoughts into your mind, but unfortunately, few people know this psychological trick—which is also not easy to apply at all.</p>
          <p>So instead of telling you that every time you have a tormenting thought you should do your best to think about something else, I will tell you about a simple practice that over time will help you regulate your emotions and become more aware of where you put your attention.</p>
          <p>This practice is <strong>stillness</strong>, and before we complicate things with some strange explanation, I will summarize the entire procedure in less than a line: sit down and do nothing. That's it.</p>
          <p>No phone, no books, no television, no talking to anyone else. It is you with your own thoughts for a few minutes, and that's it.</p>
          <p>This procedure, which is literally the most <a className='article__in-text-link' href='https://www.google.com/search?q=diferencia+entre+sencillo+y+facil&rlz=1C5CHFA_enES986ES987&oq=diferencia+entre+sencillo+&gs_lcrp=EgZjaHJvbWUqBwgBEAAYgAQyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDM4NzZqMGo0qAIAsAIA&sourceid=chrome&ie=UTF-8' target='_blank' rel='noreferrer'>simple</a> in the world, is not so <em>easy</em> to carry out.</p>
          <p>In fact, it has been studied for thousands of years and has received many names, of which the most famous is «meditation».</p>
          <p>Just as in the previous section I made a clarification for people who do not believe in evolution, in this one I make a clarification for atheists/agnostics: you do not need to believe in any God or mystical agent to practice your stillness. You do not even need to call it meditation; you only need to practice it long enough and observe your results the way a good scientist would.</p>
          <p>Stillness is the practice par excellence for learning to focus our attention. Its effectiveness is based on two advantages:</p>
          <ul>
            <li>By being completely still and without distractions, we are able to observe our thoughts without doing anything about them, which lets us recognize how much we think about something and how useful it is to do so.</li>
            <li>Continued practice teaches us to steal attention away from repetitive or useless thoughts, which, as we already know, is vital when it comes to killing tormenting thoughts.</li>
          </ul>
          <p>It is important to emphasize that <strong>you will only be able to take attention away from those thoughts you have already observed and whose message you have recognized. If you understand what they want to tell you, you will be able to soothe them.</strong> If not, you will be condemned to relive them again and again.</p>
          <h4>The complications of stillness</h4>
          <p>Being such a simple practice, it is common to fall into the idea that it is easy to incorporate into our life. Overconfidence is the worst danger of this exercise.</p>
          <p>Although we are all capable of being still, we are so, so used to being busy doing something that calm has become an unnatural state for the modern human being.</p>
          <p>For this reason the habit of practicing stillness usually dies before it is born: many people say they will do it and never do, and others start with a first session (two at most) and then abandon it with the excuse that «they will start again tomorrow».</p>
          <p>The complications of stillness come purely from excuses. Below I leave you some of the most common ones along with their solutions:</p>
          <ul>
            <li><strong>I don't have time to meditate today</strong> / You do not need «time to meditate». One minute a day is enough to start.</li>
            <li><strong>I am too tired/stressed to do it</strong> / Tiredness and stress are excellent indicators that a stillness session will do you good. It might even be exactly what you need.</li>
            <li><strong>I don't feel like it today, but I'll do it tomorrow</strong> / Every day you leave it aside it will become harder to begin. If you don't feel like it today, tomorrow you will feel like it even less. Remember that only one minute is enough.</li>
            <li><strong>I don't believe in that kind of mystical stuff</strong> / Stillness has nothing mystical about it. In fact, in recent years it has become ultra popular in the scientific world for its indisputable benefits for the brain and its composition.</li>
            <li><strong>I don't know how it's done</strong> / You do not need to know anything. Just sit in a comfortable position and do nothing. If you want to learn new techniques, which I recommend, it is enough to type «meditation» on YouTube for thousands of experts to kill themselves trying to teach you their best tricks.</li>
            <li><strong>I always say I will do it and in the end I don't</strong> / This is normal, and recognizing it is the first step to overcoming it. Many of us feel desperate after only a few seconds of doing nothing, so do not worry if it is hard at first. If this is your case I recommend you look for a guided meditation on YouTube so someone else can guide you in each session.</li>
            <li><strong>I don't like it</strong> / Nobody likes it at first. Do you think you are the only one?</li>
            <li><strong>I prefer to do something else</strong> / This is valid. Later on you may find something in Detox Mental related to «meditating without meditating» (we'll see if you get lucky). Even so, although there are other methods, I must say that stillness is by far the most effective for learning to control your attention. By far.</li>
          </ul>
          <p>If your reason for not practicing stillness is not on that list, do not despair: <strong>there is no valid reason not to try it.</strong> After all, it is about doing absolutely nothing without investing a single <a className='article__in-text-link' href='https://es.wikipedia.org/wiki/Bol%C3%ADvar_(moneda)' target='_blank' rel='noreferrer'>bolívar</a> (that is, nothing) to get started.</p>
          <p>The topic of stillness deserves an article of its own, but in the meantime, hold on to the idea that meditating will not do you any harm.</p>
          <p>In any case, if it becomes unbearable, this is a sign that your attention problem is more serious than you think (this is also normal), which means that <strong>instead of avoiding it you should go all in.</strong></p>
          <p className='article__note'>Note: if you are one of those people who has had negative experiences with meditation, do not hesitate to go to an expert. I know there are all kinds of cases. That said, make sure you have tried it correctly before drawing conclusions. If after a couple of uncomfortable sessions you declare yourself «allergic» to stillness, you are not really allergic — you are just skilled at <a className='article__in-text-link' href='https://www.reddit.com/r/QuotesPorn/comments/18z8z7s/the_first_principle_is_that_you_must_not_fool/?tl=es-es' target='_blank' rel='noreferrer'>fooling yourself.</a></p>
          <p><strong>Editor's comment [1 year and 2 months later]:</strong> In all the time that has passed since writing this text, I have learned much more about meditation (in addition to having had one more year of practice), and although what I said above still seems correct to me, I must make a couple of clarifications:</p>
          <ol>
            <li>Meditation is a practice of personal exploration, and although it has enormous therapeutic benefits, it is not therapy. You cannot (or at least should not) expect all your thought problems to be solved with meditation, and if you have deep problems you cannot even understand, <strong>the most recommended thing is that you go to therapy.</strong> This is because:</li>
            <li>Observing your thoughts is a first (and necessary) step, but not the only one you must take. Your true intention should be: first, learn to listen to them, and then, learn to decipher them: understand what they say so you can take action.</li>
          </ol>
          <p><em>[End of comment].</em></p>
          <p>That said, let's move on to the last step of the strategy: killing those tormenting thoughts.</p>
        </section>
        {/* Step 5 */}
        <section className="step-section">
          <h3><span className="step-number">5</span> Kill: practice, practice, practice</h3>
          <p>Time passed.</p>
          <p>You learned to step back from your thoughts and you no longer identify with them… At least not as much.</p>
          <p>You discovered through your own experience that unless you do something about your worst thoughts, they have no power over you. They are all bark and no bite.</p>
          <p>You had your first experiences as a killer of tormenting thoughts. You starved a couple of them to death and confirmed that once they are dead, they do not usually come back to life, and if they do, they come back weakened.</p>
          <p>You learned a couple of things about stillness. You tried it a few times and although you did not feel «enlightened» like the Buddha, you got to see the tremendous potential of this practice.</p>
          <p>What comes next?</p>
          <h4>Practice, practice, practice.</h4>
          <p>If you think your tormenting thoughts will give up after a couple of days, you are wrong. The thoughts that torment you have been gestating inside your mind for years and they are comfortable there.</p>
          <p>Worse still, <strong>you are comfortable with them</strong> because they are familiar, the usual ones. Do you know what the only thing scarier than your tormenting thoughts is? Change. Most of us are allergic to change and addicted to the familiar, so do not be surprised if after some time practicing this strategy your mind is still a battlefield.</p>
          <p>After all... you may want it that way.</p>
          <p>You may not recognize it, but at some level of your consciousness there is someone who genuinely appreciates worry, desperation, and fear.</p>
          <p>This will seem intimidating to many, and the only ones who will commit to the process are those whose thought problems are large enough that they cannot ignore them. The rest will go on with their lives as always and their tormenting thoughts will keep feeding on their attention until they become enormous brain-devouring beasts. This is how things work in our world and there is nothing to reproach.</p>
          <p>If you are one of the people who has already reached the end of your rope and cannot stand one more day of this mental torture, never forget the following two truths:</p>
          <ol>
            <li>Your emotions control your thoughts.</li>
            <li>Your tormenting thoughts are signals that you must take some action.</li>
          </ol>
          <p>Test this theory for yourself. If it turns out to be true for you, it will only be a matter of time before you manage to soften the hard thought problem you are currently suffering.</p>
          <p>Follow the message of your emotions. They point to the path you must follow to free yourself from the torment.</p>
        </section>
        {/* Recommendations and Conclusion */}
        <section className="recommendations-section">
          <h2>Creative recommendations to free yourself from the thoughts that torment you</h2>
          <p>As is customary for us at Detox Mental, we will dedicate the final part of this text to attacking the problem using our most powerful tool: creativity.</p>
          <p>With everything you have learned in this text you have enough weapons to resolve your situation, but unless you come back and read it constantly, it will be forgotten—ironically for lack of attention.</p>
          <p>Did you find this text on Google or did it appear in an Instagram ad? Did a friend recommend it? Good — you already took the first step by reading it.</p>
          <p>The thing with tormenting thoughts and with thoughts in general is that controlling them is everyday work, so <strong>the best way to stay in the process is to keep consuming related information that promotes the same kind of ideas you are having while you read these lines.</strong> As a wise person said:</p>
          <blockquote> The content you consume builds you. What are you building?</blockquote>
          <p>Below we give you three recommendations of basic books you can read (or audiobooks you can listen to) to begin your mental cleanse.</p>
          <h3>Recommended sources of information</h3>
          <ol>
            <li><strong><a className='article__in-text-link' href='https://www.amazon.es/Deja-ser-t%C3%BA-Crecimiento-personal/dp/8479538252/ref=sr_1_1?crid=2TFTXNRSLJVXQ&dib=eyJ2IjoiMSJ9.JUbvZalKHWi2WEku5a0iCcNV_zYn0cFYXjYVBaKs5bLVmjB38CN0gIeYuXAYUrEZqUpTOe515SCxLx4gGqn2P16YLbDspYqmPR2bEN3AhyLKmWbKAjpbin60cYdVaHUOrfb-tl505wXdGnH7YQXo9WXAEPwhTg2QfnAm86AyY7UMLnuzs_t0Kz4bmIbD8TGMDSsbU9TfjsVD4S3XjHC5h5mSguFkFd1vHyFDSGvA2Oz8cE2jhXXJEmmb57q1uVa1bNHp8vHqiHBRRsdh5Wvme388X3a4n5bfEyN-ftlMO0g.7GsyIy4rMBBDqGuqiR3jWLptO6RlVyamJnOIwfI3VrU&dib_tag=se&keywords=deja+de+ser+tu+de+joe+dispenza&qid=1757846186&sprefix=deja+de+ser%2Caps%2C72&sr=8-1' target='_blank' rel='noreferrer'>Breaking the Habit of Being Yourself, by Joe Dispenza</a></strong><br/>Dr. Joe Dispenza is the person you want to go to when you have problems with your thoughts and emotions. Dispenza is an author and neuroscience expert who has spent years studying the brain using cutting-edge technology and writing about it in a simple, clear way that is accessible to anyone.<br/><em>Breaking the Habit of Being Yourself</em> is the only book of his I have read and I strongly recommend it.<br/>The thesis of this book is that our mind builds our reality, and based on a completely scientific approach, the author explains how our thoughts have real power over the life we have, in addition to giving us keys to understand and manage them.</li>
            <li><strong><a className='article__in-text-link' href='https://www.amazon.es/Poder-Ahora-Gu%C3%ADa-Iluminaci%C3%B3n-Espiritual/dp/8484452069/ref=sr_1_1?crid=1YRUUGWFSRFXB&dib=eyJ2IjoiMSJ9.A1S0FQ7BA1i1zk17ngVEVBGqr9gQWvG2T01DbXqS4JSFhnfqCjbiTdQp10WVHtlhTYrltRQh2DFco8lyEyE1XVy2Zk426lunlDznBlNXni5Pm966eRJv1CPE2v8daChi27m9N5BFW4BofezySgq9s9hdsr5nX4b0bR-2X9vkCizUI9ZKOsyqafiwTc4FWe-DzdYIhEhobGIcDenPP-XgcQcyUy4_msbq2OO-WXRVH8sKaQhXdbaftYNhCt4HTbKS2IuZrWwKicPixE2RVYPoUA_hLllT9nTkntsfioofIvQ.qShOz2VazpNc-PvVcEotwrxCNxHLKQGpgUB59S0agf0&dib_tag=se&keywords=el+poder+del+ahora&qid=1757846421&sprefix=el+poder+del+%2Caps%2C68&sr=8-1' target='_blank' rel='noreferrer'>The Power of Now, by Eckhart Tolle</a></strong><br/>If you have been to Detox Mental before you will have noticed that I recommend this book repeatedly. This is because <em>The Power of Now</em> is one of those reads that changed me as a person.<br/>Reading it I discovered that I spend most of my time on «autopilot» and the mere fact of noticing it started me on a path of self-knowledge that will continue for the rest of my life.<br/>This book helps you understand that your thoughts do not govern your life and makes you reflect on all the stress generated by things that are outside your control.</li>
            <li><strong><a className='article__in-text-link' href='https://www.amazon.es/SUTIL-ARTE-IMPORTE-MIERDA-HARPERCOLLINS/dp/8491392289/ref=sr_1_1?crid=1DSYL4HYAMHU4&dib=eyJ2IjoiMSJ9.rZMndsxuqKLWnayIn1Wmj6viU_SGB-Eh-iA9LklKlpAMidjuoM9yRh_njJdvR1BU1OpWhEt8DYXeH9Or9OqkpRQyO7TG9fDoSvgJ7fLqKGyZTOBVJINEpXSfGzT8nzmjQO6H-wnQXL9RpjXpyJgjTpujm3SEdIxvyJUkroV312R7vo6jTDvWSxRIszMhDITmjZrGmstak-kxLBii1Cqu46zoGpiC6YbRpOoCUB66nxLPAuccwcyZv7PK85jmtmo4fngsax6w0bVWLpsoGAd99Pe6X-EOCzwX_HooTlODmJk.lyshv2eL9B31uRFdAprhibiBiwVhGTzutev7nCB3GVA&dib_tag=se&keywords=el+sutil+arte+de+que+casi+todo+te+importe&qid=1757846521&sprefix=el+s%2Caps%2C71&sr=8-1' target='_blank' rel='noreferrer'>The Subtle Art of Not Giving a F*ck, by Mark Manson</a></strong><br/>This book, whose title already works in English, is one of those mega bestsellers that have reasons to be so famous.<br/>The main idea of this book is that we worry about so many unnecessary things that at a certain point our life loses meaning. Instead, if we choose wisely the things that do matter to us and send everything else to hell, we automatically recover that meaning and leave behind most of our limitations—mainly because we realize that, in most cases, we no longer care about having «limitations».</li>
          </ol>
          <p className='article__note'>Recommendations note: remember that if you are «allergic» to books you always have the option of listening to them as an audiobook. Do not miss out on good information just because you do not have the habit of reading.</p>
          <p><strong>Editor's comment [1 year and 2 months later]:</strong> The books recommended above were valuable to me, but recently (December 2021) I discovered a source of information as powerful as all of the previous ones: <a className='article__in-text-link' href='https://www.youtube.com/@Paramitaorg' target='_blank' rel='noreferrer'>Paramita</a>, a YouTube channel dedicated to Buddhist teachings.</p>
          <p>Was I born Buddhist? No. Do I currently consider myself Buddhist? No. And even though the answers to those questions are negative, there is something I can state with authority: what I learned from that channel transformed me deeply.</p>
          <p>I now have more peace, more happiness, and a deeper understanding of reality than before. If you are suffering because of your tormenting thoughts and you need something fast and free that can help you, go to Paramita.</p>
          <p>Obviously, this topic has a lot more to unpack.</p>
          <p>Buddhism is not for everyone. Maybe the teacher (Lama Rinchen) will not sit well with you, or maybe you are simply against spirituality in general. But in short, if I had to give a single recommendation to our readers for establishing practices that help restore order in their mind, it would be this one.</p>
          <p><em>[End of comment].</em></p>
          <h3>Recommended actions</h3>
          <ol>
            <li><strong>Write your thoughts on paper</strong><br/>Of all the recommendations I can give you to release your tormenting thoughts, this is the main one: find an old notebook you have at home or buy a new one and start writing all your thoughts frenetically. Go!<br/>For those who do not know, there is magic in writing. Writing our ideas on paper is one of the most powerful methods for understanding ourselves, and speaking of tormenting thoughts we need to understand before we can release them, it would be a great tragedy not to use writing as the main tool to carry out this mission.<br/>Of all the things I did while my tormenting thoughts were chasing me, journal writing is the one I dedicated the most time to. (Given what my tormenting thoughts were like, imagine what was in that notebook...)<br/>You do not need to be sophisticated at all when you write your worries. By simply recounting with honesty the things that go through your mind, you will quickly find your <a className='article__in-text-link' href='https://www.google.com/search?q=estado+de+flujo&sca_esv=adba07b31be7c891&rlz=1C5CHFA_enES986ES987&sxsrf=AE3TifNdXLgkCe3ogBFwA4APxExJapAl8A%3A1757847174319&ei=hp7GaLqcE5Hsi-gPspyB8AM&ved=0ahUKEwi695ODi9iPAxUR9gIHHTJOAD4Q4dUDCBA&uact=5&oq=estado+de+flujo&gs_lp=Egxnd3Mtd2l6LXNlcnAiD2VzdGFkbyBkZSBmbHVqbzIKECMYgAQYJxiKBTIKEAAYgAQYQxiKBTIKEAAYgAQYQxiKBTIKEAAYgAQYQxiKBTIFEAAYgAQyBRAAGIAEMgoQABiABBhDGIoFMgUQABiABDIFEAAYgAQyBRAAGIAESM0lULoDWIEgcAl4AZABAZgBcqAB7Q2qAQQyMC4xuAEDyAEA-AEBmAINoAKxA8ICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIKEAAYgAQYFBiHAsICCxAuGIAEGLEDGIMBwgIaEC4YgAQYsQMYgwEYlwUY3AQY3gQY4ATYAQGYAwCIBgGQBgq6BgYIARABGBSSBwQxMS4yoAfPqQGyBwMyLjK4B4ADwgcEMi0xM8gHQQ&sclient=gws-wiz-serp' target='_blank' rel='noreferrer'><em>flow</em></a> and release a great tension you carry inside.<br/>Best of all: the solutions will start to appear. Try it for yourself and discover the great power hidden in the written word.</li>
            <li><strong>Go to therapy</strong><br/>In previous decades therapy was rejected and considered something that only served to help the crazy, the mentally ill. Things have changed a lot in recent years.<br/>Today, therapy is one of those things we all know we should do but that we always leave for later. It is strange for many people, it consumes time and money, and in some cases we are not very sure how much it can help us.<br/>This short text is to tell you that yes, it will help you. And a lot.<br/>We have all had the experience of telling our problems to a friend and feeling much better afterward. Now imagine how you would feel if instead of a friend you had an expert in listening to problems.<br/>Someone who has done it daily for years and whose advice is backed by a science that has spent decades studying and solving problems like yours.<br/>Much better than the «I get you» of your well-intentioned friend, that's for sure.<br/>A safe space to talk about your tormenting thoughts can be invaluable. If you have the money and the opportunity to do it, do not waste it. Your future self will thank you.<br/>Note: do not use your partner as a therapist. You can talk to them about your problems, but if this becomes more repetitive than it should, your relationship will end up rusting over time.<br/></li>
            <p className='article__note'><strong>Editor's note [4 years later]:</strong> After 3+ years of doing therapy consecutively, I must clarify that this is not just another recommendation: it is <em>the</em> recommendation.<br/>Even if your thought problem is not as big as it seems, at some point in your life you should take the initiative to meet with a professional to discuss your mental health. Whether you are well or belong in a psych ward.<br/>Of course starting with books, articles, and courses is a great first step, but always keep skepticism toward what you find on the internet (do not believe everything you find on the web. Even less on social media) and even if you do everything there is to do on your own, we recommend that you always have as a final goal having the support of a certified psychologist. In my experience, in a short time you manage to move forward on issues that seemed impossible to resolve, and on the other hand... there is simply magic in paying someone to listen to your problems. Again: starting on your own is fantastic. Thinking about professional help for the near future is <em>responsible.</em></p>
          </ol>
        </section>
          <h3>Conclusions</h3>
          <p>The 5 steps to free yourself from the thoughts that torment you are:</p>
          <ol>
            <li><strong>Step back:</strong> you are NOT your mind.</li>
            <li><strong>Recognize:</strong> your thoughts cannot harm you… If you do not let them.</li>
            <li><strong>Understand:</strong> every thought dies if you do not feed it with your attention.</li>
            <li><strong>Arm yourself:</strong> learn to manage your attention using stillness as your main weapon.</li>
            <li><strong>Kill:</strong> practice as much as you need until you become a relentless exterminator of tormenting thoughts.</li>
          </ol>
          <p><strong>Important:</strong></p>
          <p><strong>Your emotions control your thoughts</strong> and <strong>your tormenting thoughts are signals that are screaming at you to take action.</strong> What is something you should be doing that could ease your torment? That is the question you must ask yourself constantly.</p>
          <p>Read. Listen. Think. Write. Use your creativity. All of these actions will bring you closer to your goal of freeing your mind from thoughts that torment you, and the more you practice them, the faster and better you will get out of this situation.</p>
          <p>Do not underestimate how little control you have over your mind</p>
          <p>Knowing how to direct our attention is one of the hardest skills to develop today.</p>
          <p>Despite this, it is possible to improve and gain «distance» from our thoughts.</p>
          <p>You are not your mind. Likewise, you do not choose your thoughts, but <strong>you do decide whether they survive or not.</strong></p>
          <p>In my case, what could have become a trauma ended up as an excellent practice for my mental strength, and the best part is that I did not need great efforts or medical interventions to achieve it.</p>
          <p>In my opinion, we all must learn how our own mind works and develop practices and tools to control it when necessary.</p>
          <p>Start by not judging what goes through your head and you will start to see positive results: less stress, less anxiety, more happiness, more calm, more freedom.</p>
          <p>Understand your thoughts and do not give them more importance than they have. Your mental health will benefit from the day you start doing so.</p>
          <p>Make use of this knowledge and the recommendations set out in this text, and in less time than you imagine, you will once again live free of the thoughts that torment you.</p>
          <hr className='article__final-line'/>
          <div className='article__final-points-container'>
            <span className='article__final-point article__final-point--1'>•</span>
            <span className='article__final-point article__final-point--2'>•</span>
            <span className='article__final-point article__final-point--3'>•</span>
            <span className='article__final-point article__final-point--4'>•</span>
          </div>
    </>
  );
}

function WantMore() {
  return (
    <>
            <p>If you have made it this far, two things are clear:</p>
            <ol>
              <li>You have thoughts that torment you.</li>
              <li>You have a certain commitment to the mission of dealing with them.</li>
            </ol>
            <p>The question is:</p>
            <p><strong>Enough commitment to take real action?</strong></p>
            <p>Let's be honest: not even the best of texts will be able to free you completely from your tormenting thoughts.</p>
            <p>How long did it take you to read this text? 20 minutes? Half an hour? An hour if you went slowly and took notes?</p>
            <p>And how old are you? 18? 28? Over 30? Over 40?</p>
            <p>Whatever your answers, one thing is certain: your tormenting thoughts have been gestating in your mind for more than 10 years. For many hours every day.</p>
            <p>After hundreds or thousands of hours forming, those tormenting thoughts will not leave in a single sitting. Reading the text is a good first step, but if you want a real impact, you must take measures over a longer period of time.</p>
            <p>At Detox Mental we believe in real change. That is why we created a complete audio course that expands the 5 steps of the strategy discussed in the text.</p>
            <p>The course consists of 15 audio sessions accompanied by 15 writing activities designed to understand and process the thoughts that torment you.</p>
            <p>But again, the question is...</p>
            <p>Is your commitment enough to take real action?</p>
    </>
  );
}
