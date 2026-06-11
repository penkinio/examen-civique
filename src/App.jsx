import { useState, useEffect } from 'react';
import naturalisationBank from './qcm/naturalisation.json';
import residentBank from './qcm/resident.json';
import pluriannuelleBank from './qcm/pluriannuelle.json';

// Configuration des types de QCM
const QUIZ_CONFIGS = {
  naturalisation: {
    name: "Naturalisation",
    bank: naturalisationBank,
    length: 40,
    description: "Préparez votre entretien de naturalisation française."
  },
  resident: {
    name: "Carte de Résident",
    bank: residentBank,
    length: 40,
    description: "Test pour l'obtention de la carte de résident."
  },
  pluriannuelle: {
    name: "Carte Pluriannuelle",
    bank: pluriannuelleBank,
    length: 40,
    description: "Test pour la carte de séjour pluriannuelle."
  }
};

// Fonction pour mélanger un tableau (Fisher-Yates)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ExamenCivique() {
  const [quizType, setQuizType] = useState('naturalisation');
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'quiz', 'result', 'review'

  const TIMER_DURATION = 45;

  const categoryStyles = {
    "Principes et valeurs de la République": "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    "Système institutionnel et politique": "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    "Droits et devoirs": "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    "Histoire, géographie et culture": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    "Vivre dans la société française": "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    "default": "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
  };

  const getCategoryStyle = (category) => categoryStyles[category] || categoryStyles["default"];

  useEffect(() => {
    // On ne lance plus le quiz automatiquement au montage
  }, []);

  const startNewQuiz = () => {
    const config = QUIZ_CONFIGS[quizType];
    const shuffledBank = shuffleArray(config.bank);
    const selectedQuestions = shuffledBank.slice(0, Math.min(config.length, shuffledBank.length));

    const questionsWithOptionsShuffled = selectedQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    setQuestions(questionsWithOptionsShuffled);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setCurrentIndex(0);
    setTimeLeft(TIMER_DURATION);
    setViewMode('quiz');
  };

  const handleOptionChange = (questionIndex, selectedOption) => {
    if (!isSubmitted) {
      setUserAnswers(prev => ({
        ...prev,
        [questionIndex]: selectedOption
      }));
    }
  };

  const handleSubmit = () => {
    let currentScore = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);
    setViewMode('result');
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (viewMode !== 'quiz' || isSubmitted) return;

    if (timeLeft === 0) {
      if (currentIndex === questions.length - 1) {
        handleSubmit();
      } else {
        nextQuestion();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, viewMode, isSubmitted, currentIndex, questions.length]);

  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
  }, [currentIndex]);

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const isPassed = percentage >= 80;

  if (viewMode !== 'selection' && questions.length === 0) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  const renderSelection = () => {
    return (
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Choisissez votre type de test
        </h2>
        <div className="grid gap-4 mb-8">
          {Object.entries(QUIZ_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setQuizType(key)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                quizType === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{config.name}</span>
                {quizType === key && (
                  <span className="bg-blue-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">{config.description}</p>
              <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">{config.length} questions</p>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={startNewQuiz}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all transform active:scale-95"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const q = questions[currentIndex];
    const isAnswered = userAnswers[currentIndex] !== undefined;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto w-full">
        {/* Timer and Progress */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Question {currentIndex + 1} sur {questions.length}</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className={`flex items-center justify-center px-4 py-2 rounded-xl border-2 ${timeLeft <= 10 ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600'} transition-colors duration-300`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryStyle(q.categorie)}`}>
              {q.categorie}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {q.question}
          </h2>
          
          <div className="space-y-3">
            {q.options.map((option, optIndex) => {
              const isSelected = userAnswers[currentIndex] === option;
              return (
                <label 
                  key={optIndex} 
                  className={`
                    flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleOptionChange(currentIndex, option)}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-4 text-gray-700 dark:text-gray-300 font-medium">{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-0 transition-all"
          >
            Précédent
          </button>
          
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              Terminer le test
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={!isAnswered}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              Suivant
            </button>
          )}
        </div>
        {Object.keys(userAnswers).length < questions.length && currentIndex === questions.length - 1 && (
            <p className="text-center text-sm text-red-500 mt-4">Répondez à toutes les questions pour soumettre.</p>
        )}
      </div>
    );
  };

  const renderResult = () => {
    const categoryStats = questions.reduce((acc, q, index) => {
      const category = q.categorie;
      if (!acc[category]) {
        acc[category] = { total: 0, correct: 0 };
      }
      acc[category].total += 1;
      if (userAnswers[index] === q.answer) {
        acc[category].correct += 1;
      }
      return acc;
    }, {});

    return (
      <div className="max-w-2xl mx-auto w-full text-center">
        <div className={`p-8 rounded-3xl shadow-2xl ${isPassed ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'} border-2`}>
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isPassed ? 'bg-green-500' : 'bg-red-500'} text-white text-4xl`}>
            {isPassed ? '✓' : '✕'}
          </div>
          <h2 className={`text-3xl font-extrabold mb-2 ${isPassed ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
            {isPassed ? 'Félicitations !' : 'Essai non concluant'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {isPassed ? 'Vous avez réussi l\'examen civique.' : 'Vous n\'avez pas encore atteint les 80% requis.'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Score global</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{score} / {questions.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pourcentage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</p>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Résultats par catégorie</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const catPercentage = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={category} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryStyle(category)}`}>
                        {category}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.correct} / {stats.total} ({catPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${catPercentage >= 80 ? 'bg-green-500' : catPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${catPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setViewMode('selection')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Recommencer
            </button>
            <button
              onClick={() => setViewMode('review')}
              disabled={percentage === 100}
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Voir mes erreurs
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = () => {
    return (
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold dark:text-white">Correction détaillée</h2>
          <button 
            onClick={() => setViewMode('result')}
            className="text-blue-600 dark:text-blue-400 font-semibold"
          >
            Retour au score
          </button>
        </div>
        
        <div className="space-y-6">
          {questions.map((q, index) => {
            const isCorrect = userAnswers[index] === q.answer;
            return (
              <div key={index} className={`p-6 rounded-2xl border-2 ${isCorrect ? 'border-green-100 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10' : 'border-red-100 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10'}`}>
                <div className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryStyle(q.categorie)}`}>
                        {q.categorie}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white mb-4 text-lg">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => {
                        const isUserChoice = userAnswers[index] === option;
                        const isCorrectOption = option === q.answer;
                        
                        let optionStyle = "p-3 rounded-xl text-sm font-medium border ";
                        if (isCorrectOption) {
                          optionStyle += "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-300";
                        } else if (isUserChoice && !isCorrectOption) {
                          optionStyle += "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-300";
                        } else {
                          optionStyle += "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400";
                        }

                        return (
                          <div key={optIndex} className={optionStyle}>
                            <div className="flex justify-between items-center">
                              <span>{option}</span>
                              {isCorrectOption && <span className="text-xs uppercase font-bold ml-2">Bonne réponse</span>}
                              {isUserChoice && !isCorrectOption && <span className="text-xs uppercase font-bold ml-2">Votre choix</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Detailed Answer Section */}
                    <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-900 dark:text-blue-300">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs uppercase font-bold tracking-wider mb-1 opacity-70">En savoir plus</p>
                          <p className="text-sm font-medium leading-relaxed">{q.detailAnswer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center pb-12">
          <button
            onClick={() => setViewMode('selection')}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all"
          >
            Changer de test
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 dark:text-blue-400 mb-4 tracking-tight">
          Examen Civique
        </h1>
        <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl max-w-lg mx-auto">
          {viewMode === 'selection' 
            ? "Sélectionnez le type de questionnaire pour commencer." 
            : QUIZ_CONFIGS[quizType].description}
        </p>
      </header>

      <main className="flex flex-col items-center">
        {viewMode === 'selection' && renderSelection()}
        {viewMode === 'quiz' && renderQuiz()}
        {viewMode === 'result' && renderResult()}
        {viewMode === 'review' && renderReview()}
      </main>

      <footer className="max-w-4xl mx-auto mt-20 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>© 2026 Examen Civique. Tous droits réservés.</p>
      </footer>
    </div>
  );
}