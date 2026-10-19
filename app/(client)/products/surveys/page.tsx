"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

const SURVEY_DATA = {
  title: "Digital Marketing and Social Media Strategy",
  description: "This survey gathers insights from industry professionals and consumers on current practices, challenges, and future trends in digital marketing and social media strategy.",
  duration: "15 min",
  questionsCount: 20,
  questions: [
    { id: 1, text: "Which social media platforms do you primarily use for professional marketing purposes?", options: ["Facebook", "Instagram", "LinkedIn", "Twitter", "TikTok"] },
    { id: 2, text: "What is the average monthly budget allocated to social media advertising?", options: ["Under $500", "$500 - $1,500", "$1,500 - $3,000", "$3,000 - $5,000", "Over $5,000"] },
    { id: 3, text: "How do you measure the ROI of your social media campaigns?", options: ["Engagement metrics (likes, shares)", "Conversion tracking (sales, leads)", "Brand awareness surveys", "Cost per acquisition", "A mix of multiple metrics"] },
    { id: 4, text: "Which content format yields the highest engagement for your audience?", options: ["Short videos", "Long-form articles", "Infographics", "Live streams", "Stories/Reels"] },
    { id: 5, text: "How often do you incorporate influencer partnerships into your marketing strategy?", options: ["Never", "Occasionally (1-2 per year)", "Quarterly", "Monthly", "Weekly"] },
    { id: 6, text: "Which ad format has delivered the best conversion rates for you?", options: ["Carousel ads", "Video ads", "Lead generation forms", "Story ads", "Sponsored posts"] },
    { id: 7, text: "Do you use AI-driven tools for content creation or ad optimization?", options: ["Yes, extensively", "Yes, occasionally", "No, but interested", "No, not applicable"] },
    { id: 8, text: "What is your primary concern regarding data privacy on social media platforms?", options: ["User consent and transparency", "Platform data ownership", "Third-party data sharing", "Regulatory compliance", "Ad targeting accuracy"] },
    { id: 9, text: "How do you prioritize cross-channel integration in your marketing campaigns?", options: ["High priority, integrated across all channels", "Moderate priority, selective integration", "Low priority, mostly standalone", "No integration, separate campaigns"] },
    { id: 10, text: "Which metric is most critical when evaluating a new social media platform for your brand?", options: ["User demographic alignment", "Engagement potential", "Advertising capabilities", "Platform growth rate", "Cost of entry"] },
    { id: 11, text: "What is your preferred method for crisis communication on social media?", options: ["Pre-planned response templates", "Real-time monitoring and rapid response", "Engaging community managers", "Third-party PR agencies", "Automated alert systems"] },
    { id: 12, text: "How do you approach brand storytelling across social media channels?", options: ["Consistent narrative across all platforms", "Platform-specific storytelling", "User-generated content focus", "Data-driven storytelling", "Adversarial storytelling"] },
    { id: 13, text: "Which factor most influences your decision to invest in paid social media campaigns?", options: ["Target audience reach", "Ad format versatility", "Historical performance data", "Platform algorithm changes", "Cost per click/Impression"] },
    { id: 14, text: "How do you stay updated on algorithm changes across major social media platforms?", options: ["Official platform blogs", "Industry newsletters", "Peer networks", "Paid courses/webinars", "Trial and error"] },
    { id: 15, text: "What is the biggest challenge you face with social media analytics?", options: ["Data accuracy", "Integration with other tools", "Reporting complexity", "Real-time insights", "Attribution modeling"] },
    { id: 16, text: "Do you plan to increase your investment in short-form video content over the next 12 months?", options: ["Yes, significantly", "Yes, moderately", "No, maintain current level", "No, reduce investment", "Unsure"] },
    { id: 17, text: "Which emerging trend do you believe will most impact digital marketing in the next year?", options: ["AI-powered personalization", "Social commerce integration", "Metaverse advertising", "Privacy-first advertising models", "Augmented reality experiences"] },
    { id: 18, text: "How often do you conduct training or workshops for your marketing team on new digital tools?", options: ["Monthly", "Quarterly", "Biannually", "Annually", "Never"] },
    { id: 19, text: "What is your preferred method for measuring customer sentiment on social media?", options: ["Sentiment analysis tools", "Manual review of comments", "Surveys and polls", "Third-party analytics services", "No systematic measurement"] },
    { id: 20, text: "Which of the following best describes your organization’s overall digital marketing maturity?", options: ["Emerging – experimenting with basic tools", "Established – using multiple platforms with integrated tools", "Advanced – data-driven, AI-enabled strategy", "Industry leader – setting benchmarks", "Not applicable"] }
  ]
};

export default function SurveysPage() {
  const router = useRouter();
  const stats = useQuery(api.surveys.getSurveyStats);
  const submitReward = useMutation(api.surveys.submitSurveyReward);

  const [activeSurvey, setActiveSurvey] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === SURVEY_DATA.questionsCount;

  const handleSubmit = async () => {
    if (!stats || !isComplete) return;
    setSubmitting(true);
    try {
      await submitReward({ amount: stats.localizedReward, currency: stats.currency });
      setActiveSurvey(false);
      setAnswers({});
    } catch (e: any) {
      const errorMsg = e?.data || e?.message || "An error occurred.";
      alert(errorMsg.replace(/^Uncaught Error: ConvexError: /, '').replace(/^ConvexError: /, ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (!stats) return <div className="p-8 text-center font-bold text-[#112a46]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Market Surveys</h1>
        <button onClick={() => router.push("/dashboard")} className="text-sm font-bold text-gray-500 hover:text-[#1abc9c]">
          « Dashboard
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Wallet Balance</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">💰</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">
            {stats.currency} {stats.totalBalance.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Available in Service Balance</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Surveys Completed</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">☑️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.completedThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">1 total limit per week</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Surveys Available</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c]/10 text-[#1abc9c]">📋</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.availableThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Start earning now</p>
        </div>
      </div>

      {/* Main Survey Card */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row transition hover:shadow-md">
          <div className="flex w-full sm:w-1/3 flex-col items-center justify-center bg-gradient-to-br from-[#112a46] to-[#1a3a5e] p-8 text-white">
            <span className="text-5xl mb-4">📊</span>
            <h3 className="text-center text-xl font-black mb-2">{SURVEY_DATA.title}</h3>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              {SURVEY_DATA.duration}
            </span>
          </div>
          
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Weekly Task</span>
              <span className="text-sm font-black text-emerald-500">
                +{stats.localizedReward} {stats.currency}
              </span>
            </div>
            <p className="mb-6 text-sm text-gray-600 leading-relaxed">
              {SURVEY_DATA.description}
            </p>
            
            <button
              onClick={() => setActiveSurvey(true)}
              disabled={stats.availableThisWeek <= 0}
              className="mt-auto w-full sm:w-auto self-start rounded-xl bg-[#1abc9c] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stats.availableThisWeek <= 0 ? "Weekly Limit Reached" : "Start Survey"}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Survey Modal */}
      {activeSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112a46]/90 p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            
            {/* Modal Header & Progress */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-[#112a46]">{SURVEY_DATA.title}</h3>
                <button onClick={() => setActiveSurvey(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl leading-none">
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full bg-[#1abc9c] transition-all duration-300"
                    style={{ width: `${(answeredCount / SURVEY_DATA.questionsCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-500">{answeredCount} / {SURVEY_DATA.questionsCount}</span>
              </div>
            </div>
            
            {/* Scrollable Questions List */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-white">
              {SURVEY_DATA.questions.map((q, index) => (
                <div key={q.id} className="rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                  <p className="mb-4 text-sm font-bold text-[#112a46]">
                    <span className="text-[#1abc9c] mr-2">{index + 1}.</span> {q.text}
                  </p>
                  <div className="space-y-3">
                    {q.options.map((opt) => (
                      <label 
                        key={opt} 
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                          answers[q.id] === opt 
                            ? "border-[#1abc9c] bg-[#1abc9c]/5 text-[#1abc9c]" 
                            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => handleOptionSelect(q.id, opt)}
                          className="h-4 w-4 text-[#1abc9c] focus:ring-[#1abc9c]"
                        />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Modal Footer / Submit */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 shrink-0">
              <button
                onClick={handleSubmit}
                disabled={!isComplete || submitting}
                className="w-full rounded-xl bg-[#1abc9c] py-4 font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {!isComplete 
                  ? `Please answer all ${SURVEY_DATA.questionsCount} questions to submit` 
                  : submitting 
                    ? "Submitting..." 
                    : `Submit Survey & Claim ${stats.currency} ${stats.localizedReward}`}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}