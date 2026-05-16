import { useState } from 'react';
import ShadowScene from './components/ShadowScene';
import { Lightbulb, Maximize2, MoveRight, BookOpen, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

const questions = [
  {
    question: "ماذا يحدث لمنطقة شبه الظل عندما نستخدم مصدر ضوء نقطي (صغير جداً)؟",
    options: ["تصبح كبيرة جداً", "تختفي ولا يظهر سوى الظل التام", "تتحول إلى ضوء ساطع"],
    correct: 1
  },
  {
    question: "متى يظهر 'شبه الظل' بشكل واضح؟",
    options: ["عندما يكون مصدر الضوء واسعاً", "عندما يكون الجسم شفافاً", "في وجود مصدر ضوء نقطي فقط"],
    correct: 0
  },
  {
    question: "ماذا يحدث للظل التام عندما يقترب الجسم من مصدر الضوء؟",
    options: ["يكبر حجمه", "يصغر حجمه", "يظل كما هو"],
    correct: 0
  }
];

const onboardingData = [
  {
    title: "مرحباً بك في مختبر الظلال",
    text: "هنا ستتعلم الفرق بين الظل التام وشبه الظل وكيف يتكونان في الطبيعة.",
    icon: <Sparkles className="w-12 h-12 text-yellow-400" />
  },
  {
    title: "مصدر الضوء النقطي",
    text: "عندما يكون الضوء صغيراً جداً، يتكون ظل حاد وغامق تماماً يسمى 'الظل التام'.",
    icon: <Lightbulb className="w-12 h-12 text-blue-400" />
  },
  {
    title: "مصدر الضوء الممتد",
    text: "عندما يكون مصدر الضوء كبيراً (مثل الشمس)، نرى ظلاً غامقاً في الوسط (الظل) ويحيط به ظل خفيف يسمى 'شبه الظل'.",
    icon: <div className="p-4 bg-amber-500/20 rounded-full"><Lightbulb className="w-12 h-12 text-amber-500" /></div>
  }
];

export default function App() {
  const [lightSize, setLightSize] = useState([0.1]); // 0.1 (Point) to 2 (Area)
  const [objectDistance, setObjectDistance] = useState([3]); // 6 (Close to light) to -2 (Close to wall)
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState<any[]>([]);

  // Function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Prepare questions on mount or reset
  const prepareQuestions = () => {
    const shuffledQuestions = shuffleArray(questions).map(q => {
      const optionsWithIndex = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correct }));
      const shuffledOptions = shuffleArray(optionsWithIndex);
      return {
        question: q.question,
        options: shuffledOptions.map(o => o.text),
        correct: shuffledOptions.findIndex(o => o.isCorrect)
      };
    });
    setRandomizedQuestions(shuffledQuestions);
  };

  // Initialize questions
  useState(() => {
    prepareQuestions();
  });

  const getEducationalText = () => {
    if (lightSize[0] < 0.5) {
      return {
        title: "مصدر ضوء نقطي (صغير جداً)",
        text: "عندما يكون الضوء كالنقطة، تتكون منطقة مظلمة تماماً خلف الجسم تسمى (الظل التام). لا يوجد شبه ظل هنا لأن الضوء لا يتسرب من الأطراف.",
        color: "text-amber-400"
      };
    } else if (lightSize[0] >= 0.5 && objectDistance[0] > 0) {
      return {
        title: "الظل التام وشبه الظل",
        text: "المعجزة تحدث! لأن الضوء واسع، يُحجب الضوء تماماً في المنتصف (ظل تام)، ولكن بعض أجزاء الضوء الواسع تنجح في الوصول للأطراف مكوّنة منطقة رمادية باهتة تسمى (شبه الظل).",
        color: "text-emerald-400"
      };
    } else {
      return {
        title: "القرب من الحائط",
        text: "عندما يقترب الجسم جداً من الحائط (الشاشة)، يختفي شبه الظل تقريباً ويصبح الظل التام حاداً وقوياً جداً.",
        color: "text-blue-400"
      };
    }
  };

  const eduContent = getEducationalText();

  const handleSliderChange = (type: 'light' | 'object', val: number) => {
    setHasInteracted(true);
    if (type === 'light') setLightSize([val]);
    if (type === 'object') setObjectDistance([val]);
  };

  const handleAnswer = (index: number) => {
    let newScore = score;
    const currentQ = randomizedQuestions[currentQuestion];
    if (index === currentQ.correct) {
      newScore += 1;
      setScore(newScore);
    }
    
    if (currentQuestion < randomizedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      // Integration with Articulate Storyline 360
      try {
        if (window.parent && (window.parent as any).GetPlayer) {
          const player = (window.parent as any).GetPlayer();
          if (player) {
            player.SetVar("ShadowQuizScore", newScore);
            player.SetVar("ShadowQuizCompleted", true);
          }
        }
      } catch (e) {
        console.log("Storyline integration error:", e);
      }

      // Fallback Integration with postMessage
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ 
            type: 'SHADOW_LAB_COMPLETED', 
            score: newScore,
            total: randomizedQuestions.length
          }, '*');
        }
      } catch (e) {
        console.log("postMessage error:", e);
      }
    }
  };

  const resetActivity = () => {
    prepareQuestions();
    setShowQuiz(false);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setHasInteracted(false);
    setLightSize([0.1]);
    setObjectDistance([3]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-6 pb-12 px-4 sm:px-8 relative overflow-hidden">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 relative">
            <div className="animate-pulse">
              {onboardingData[onboardingStep].icon}
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-white">
                {onboardingData[onboardingStep].title}
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg">
                {onboardingData[onboardingStep].text}
              </p>
            </div>

            <div className="flex gap-2 mb-2">
              {onboardingData.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === onboardingStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                console.log("Onboarding step clicked:", onboardingStep);
                if (onboardingStep < onboardingData.length - 1) {
                  setOnboardingStep(prev => prev + 1);
                } else {
                  console.log("Finishing onboarding");
                  setShowOnboarding(false);
                }
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer relative z-[60]"
            >
              {onboardingStep === onboardingData.length - 1 ? "ابدأ التجربة" : "التالي"}
            </button>
          </div>
        </div>
      )}

      {/* Header section */}
      <header className="max-w-6xl mx-auto w-full mb-8 text-center sm:text-right">
        <div className="inline-flex items-center justify-center sm:justify-start gap-3 mb-2">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Lightbulb className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            مختبر الظلال التفاعلي
          </h1>
        </div>
        <p className="text-slate-400 text-lg mt-2 font-medium">
          اكتشف كيف يتكون الظل! حرّك المقابض للتحكم في الضوء والجسم.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* 3D Scene Container */}
        <section className="flex-1 min-h-[500px] lg:min-h-0 order-2 lg:order-1 relative">
          <ShadowScene 
            lightSize={lightSize[0]} 
            objectDistance={objectDistance[0]} 
          />
        </section>

        {/* Controls Panel */}
        <section className="w-full lg:w-96 order-1 lg:order-2 flex flex-col gap-6">
          
          {/* Information Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              ماذا نرى الآن؟
            </h2>
            <div className="space-y-3">
              <h3 className={`text-lg font-bold ${eduContent.color} flex items-center gap-2`}>
                <Sparkles className="w-4 h-4" />
                {eduContent.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {eduContent.text}
              </p>
            </div>
          </div>

          {/* Controls OR Quiz */}
          {!showQuiz ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-center gap-8">
              <h2 className="text-xl font-bold border-b border-slate-800 pb-4">
                لوحة التحكم
              </h2>

              {/* Light Size Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    حجم مصدر الضوء
                  </label>
                  <span className="text-sm px-2 py-1 bg-slate-800 rounded-md text-amber-300 font-mono">
                    {lightSize[0] < 0.5 ? 'نقطة (صغير)' : 'مصباح واسع'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.1"
                  value={lightSize[0]}
                  onChange={(e) => handleSliderChange('light', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>نقطة صغيرة</span>
                  <span>واسع جداً</span>
                </div>
              </div>

              {/* Object Distance Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200 flex items-center gap-2">
                    <MoveRight className="w-4 h-4 text-emerald-400" />
                    مسافة الجسم (التفاحة)
                  </label>
                  <span className="text-sm px-2 py-1 bg-slate-800 rounded-md text-emerald-300 font-mono">
                    {objectDistance[0] > 4 ? 'قريب من الضوء' : objectDistance[0] < 0 ? 'قريب من الشاشة' : 'في المنتصف'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="6"
                  step="0.1"
                  value={objectDistance[0]}
                  onChange={(e) => handleSliderChange('object', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>قريب للشاشة</span>
                  <span>قريب للضوء</span>
                </div>
              </div>

              {hasInteracted && (
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  اختبر معلوماتك الآن!
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-center gap-6">
              {!quizCompleted ? (
                <>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold">تمرين سريع</h2>
                    <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">
                      السؤال {currentQuestion + 1} من {questions.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4">
                    <p className="text-lg font-medium leading-relaxed text-slate-200">
                      {questions[currentQuestion].question}
                    </p>
                    <div className="space-y-3 mt-2">
                      {questions[currentQuestion].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className="w-full text-right p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 flex flex-col items-center gap-4">
                  {score === questions.length ? (
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  ) : (
                    <XCircle className="w-16 h-16 text-amber-500" />
                  )}
                  <h2 className="text-2xl font-bold">
                    النتيجة: {score} من {questions.length}
                  </h2>
                  <p className="text-slate-400 mb-4">
                    {score === questions.length ? "ممتاز! لقد فهمت الدرس جيداً." : "لا بأس! يمكنك إعادة التجربة للتعلم أكثر."}
                  </p>
                  <button 
                    onClick={resetActivity}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                  >
                    إعادة التجربة
                  </button>
                </div>
              )}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
