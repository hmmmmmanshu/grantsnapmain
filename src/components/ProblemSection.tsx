
import { AlertTriangle, Clock, DollarSign, FileX } from "lucide-react";

const ProblemSection = () => {
  const problems = [
    {
      icon: FileX,
      title: "Application Overload",
      description: "Entrepreneurs spend 40+ hours per week on paperwork instead of building their product.",
      stat: "40+ hours/week"
    },
    {
      icon: DollarSign,
      title: "Expensive Help",
      description: "Hiring consultants costs $2K-3K/month and interns cost $500-600/month just for form filling.",
      stat: "$30K+ annually"
    },
    {
      icon: Clock,
      title: "Missed Deadlines",
      description: "97% of entrepreneurs miss funding opportunities due to complex application processes.",
      stat: "97% miss out"
    },
    {
      icon: AlertTriangle,
      title: "Information Overload",
      description: "Tracking 100+ funding sources manually leads to confusion and missed opportunities.",
      stat: "100+ sources"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 sm:mb-4 lg:mb-6 px-4">
            The Funding Challenge is <span className="text-red-500">Real</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Entrepreneurs are drowning in paperwork while competitors are building. 
            <span className="hidden sm:inline"> The traditional funding process is broken.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="bg-white border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-block p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-100 border border-red-200 mb-3 sm:mb-4">
                <problem.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-red-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-2">{problem.stat}</div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black mb-2 sm:mb-3">{problem.title}</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center px-4">
          <div className="inline-block bg-white border-2 border-red-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg font-semibold">
              😤 Frustrated with the endless paperwork?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
