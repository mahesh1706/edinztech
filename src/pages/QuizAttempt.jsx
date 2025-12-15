import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../lib/api';

export default function QuizAttempt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { 0: 1, 1: 0 } -> questionIndex: optionIndex
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/me/quizzes/${id}`);
                setQuiz(res.data);
            } catch (err) {
                console.error("Failed to load quiz", err);
                setError(err.response?.data?.message || 'Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleOptionSelect = (optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;

        setSubmitting(true);
        try {
            const res = await api.post(`/me/quizzes/${id}/submit`, { answers });
            setResult(res.data); // { success, score, passed, summary }
        } catch (err) {
            console.error("Submission failed", err);
            setError(err.response?.data?.message || 'Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading quiz...</div>;
    if (error) return (
        <div className="p-8 max-w-2xl mx-auto text-center">
            <Card className="p-8 border-red-100 bg-red-50">
                <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-800 mb-2">Error</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Link to="/dashboard/quizzes" className="text-blue-600 hover:underline">Back to Quizzes</Link>
            </Card>
        </div>
    );

    if (result) {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <Card className={`p-8 text-center border-t-8 ${result.passed ? 'border-t-green-500' : 'border-t-red-500'}`}>
                    {result.passed ? (
                        <Icons.CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    ) : (
                        <Icons.AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    )}

                    <h2 className="text-3xl font-bold mb-2">
                        {result.passed ? 'Congratulations! You Passed' : 'Quiz Failed'}
                    </h2>
                    <p className="text-gray-600 mb-6">{result.summary}</p>

                    <div className="text-5xl font-black mb-8 text-secondary">
                        {result.score.toFixed(0)}%
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link to="/dashboard/quizzes">
                            <Button variant="outline">Back to List</Button>
                        </Link>
                        {/* Retry logic could go here if allowed */}
                    </div>
                </Card>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
                    <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-semibold text-primary block">Time Remaining</span>
                    <span className="text-xl font-mono text-gray-700">--:--</span> {/* Todo: Timer */}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            <Card className="p-8 min-h-[400px] flex flex-col justify-between">
                <div>
                    <div className="mb-6">
                        {question.image && (
                            <div className="mb-4">
                                <img src={question.image} alt="Question Reference" className="max-h-64 rounded-lg border border-gray-200" />
                            </div>
                        )}
                        <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                            {question.question}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({question.marks || 1} Marks)
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {question.type === 'text' ? (
                            <textarea
                                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[150px]"
                                placeholder="Type your answer here..."
                                value={answers[currentQuestion] || ''}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
                            />
                        ) : (
                            question.options?.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center
                                        ${answers[currentQuestion] === idx
                                            ? 'border-primary bg-primary/5 text-primary font-medium shadow-sm'
                                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold mr-3 text-sm group-hover:bg-white">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {opt}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    {isLastQuestion ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                        >
                            Next Question
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
