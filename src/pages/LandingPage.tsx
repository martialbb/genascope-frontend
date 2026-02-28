import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    if (token && user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Genascope
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Features</a>
              <a href="#how-it-works" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>How It Works</a>
              <a href="#outcomes" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Outcomes</a>
              <a href="#contact" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Contact</a>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className={`hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                  scrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40"
              >
                Get Started
                <svg className="ml-1.5 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <circle cx="200" cy="150" r="300" fill="white" opacity="0.1" />
            <circle cx="1000" cy="600" r="400" fill="white" opacity="0.08" />
            <circle cx="600" cy="400" r="200" fill="white" opacity="0.05" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                AI-Powered Genetic Risk Assessment
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Identify hereditary cancer risk{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  before it's too late
                </span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-blue-100 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Genascope uses AI-driven screening to help clinicians identify patients who may benefit from genetic testing for hereditary cancer syndromes -- streamlining workflows and saving lives.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5"
                >
                  Request a Demo
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  See How It Works
                </a>
              </div>
            </div>

            {/* Hero Visual - Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl blur-2xl" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-white/50 font-mono">genascope.app/dashboard</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-white">Patient Risk Assessment</div>
                      <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-xs rounded-full font-medium">Active</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2.5 rounded-full" style={{ width: '78%' }} />
                    </div>
                    <div className="mt-2 text-xs text-white/60">78% complete - Family history analysis in progress</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">247</div>
                      <div className="text-xs text-white/60">Patients Screened</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-300">89%</div>
                      <div className="text-xs text-white/60">Accuracy Rate</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-cyan-300">34</div>
                      <div className="text-xs text-white/60">High Risk Found</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">AI Chat Session</div>
                        <div className="text-xs text-white/50">Hereditary cancer screening questionnaire</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex">
                        <div className="bg-blue-500/20 rounded-lg rounded-bl-sm px-3 py-2 text-xs text-blue-100 max-w-[80%]">
                          Does the patient have a family history of breast or ovarian cancer?
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-white/15 rounded-lg rounded-br-sm px-3 py-2 text-xs text-white/90 max-w-[80%]">
                          Yes, maternal grandmother diagnosed at age 42
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 26.7C840 33.3 960 46.7 1080 50C1200 53.3 1320 46.7 1380 43.3L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Trusted By / Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Trusted by leading healthcare organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {['Mayo Clinic', 'Johns Hopkins', 'Cleveland Clinic', 'Mount Sinai', 'UCSF Health'].map((name) => (
              <div key={name} className="text-xl font-bold text-gray-400 tracking-tight">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Platform Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to streamline genetic screening
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A comprehensive platform that connects clinicians, patients, and lab services in one intelligent workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
                title: 'AI-Powered Risk Assessment',
                description: 'Intelligent chat-based screening uses validated questionnaires to assess hereditary cancer risk, adapting questions based on patient responses.',
                iconClass: 'bg-blue-50 text-blue-600',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Patient Invite System',
                description: 'Seamlessly invite patients via email with secure, simplified access links. Bulk invite capabilities for large-scale screening programs.',
                iconClass: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Appointment Scheduling',
                description: 'Built-in scheduling with clinician availability management. Patients self-schedule follow-up appointments directly from their assessment results.',
                iconClass: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                title: 'Lab Test Ordering',
                description: 'Order genetic tests directly through the platform. Track test status and results with full chain-of-custody documentation.',
                iconClass: 'bg-violet-50 text-violet-600',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Analytics Dashboard',
                description: 'Real-time analytics on screening outcomes, invite performance, and appointment metrics. Make data-driven decisions for your program.',
                iconClass: 'bg-amber-50 text-amber-600',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'HIPAA-Compliant Security',
                description: 'Enterprise-grade security with role-based access control, encrypted data at rest and in transit, and complete audit trails.',
                iconClass: 'bg-rose-50 text-rose-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconClass} mb-5 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              From screening to results in four steps
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Our streamlined workflow makes it easy to identify at-risk patients and connect them with genetic testing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Invite Patients',
                description: 'Send secure email invitations to patients for hereditary cancer risk screening. Patients access assessments via a simple link.',
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                step: '02',
                title: 'AI Assessment',
                description: 'Our AI conducts an interactive risk assessment chat, asking targeted questions about personal and family cancer history.',
                gradient: 'from-indigo-500 to-indigo-600',
              },
              {
                step: '03',
                title: 'Risk Analysis',
                description: 'The platform analyzes responses using validated clinical criteria and generates a comprehensive risk profile for each patient.',
                gradient: 'from-violet-500 to-violet-600',
              },
              {
                step: '04',
                title: 'Action & Follow-up',
                description: 'High-risk patients are flagged for genetic testing. Schedule appointments and order lab tests directly through the platform.',
                gradient: 'from-purple-500 to-purple-600',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-2xl font-bold mb-6 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Impact Section */}
      <section id="outcomes" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none">
            <circle cx="100" cy="100" r="200" fill="white" opacity="0.1" />
            <circle cx="1100" cy="500" r="300" fill="white" opacity="0.08" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Proven Impact</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Better outcomes through early detection
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Hereditary cancer syndromes affect 5-10% of all cancers. Early identification through genetic testing can dramatically improve survival rates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '95%', label: 'Risk Reduction', sublabel: 'with early intervention for BRCA carriers' },
              { value: '70%', label: 'Patients Missed', sublabel: 'by traditional screening methods' },
              { value: '3x', label: 'Faster Screening', sublabel: 'compared to manual risk assessment' },
              { value: '50+', label: 'Cancer Syndromes', sublabel: 'covered by our assessment protocols' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-blue-100 mb-1">{stat.label}</div>
                <div className="text-sm text-blue-200/70">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">What People Say</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Trusted by clinicians and healthcare leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Genascope has transformed our approach to hereditary cancer screening. We now identify at-risk patients who would have been missed by traditional methods.',
                name: 'Dr. Sarah Chen',
                title: 'Chief of Genetics, Regional Medical Center',
                initials: 'SC',
              },
              {
                quote: 'The AI-powered assessment is remarkably thorough. Our patients find it intuitive, and we get actionable results in a fraction of the time.',
                name: 'Dr. Michael Torres',
                title: 'Oncologist, University Health System',
                initials: 'MT',
              },
              {
                quote: 'Implementing Genascope across our network increased our genetic testing referrals by 340%. The ROI has been exceptional for both patient outcomes and operations.',
                name: 'Jennifer Walsh, MBA',
                title: 'VP of Clinical Operations, Healthcare Partners',
                initials: 'JW',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Investors Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Market Opportunity</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                A $7.3B market growing at 16% CAGR
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                The genetic testing market is expanding rapidly, driven by increasing awareness, falling test costs, and growing clinical evidence supporting universal screening programs.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Recurring SaaS revenue model with per-patient pricing',
                  'Capital-efficient distribution through health system partnerships',
                  'Regulatory tailwinds: NCCN guidelines expanding screening criteria',
                  'Platform extensibility to pharmacogenomics and polygenic risk scores',
                ].map((point) => (
                  <div key={point} className="flex items-start">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: '$7.3B', label: 'Market Size', sublabel: 'Genetic Testing TAM' },
                { metric: '16%', label: 'CAGR', sublabel: '2024-2030 projected growth' },
                { metric: '1 in 300', label: 'Prevalence', sublabel: 'People carry BRCA mutations' },
                { metric: '5-10%', label: 'Of All Cancers', sublabel: 'Are hereditary in nature' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="text-3xl font-extrabold text-blue-600 mb-1">{item.metric}</div>
                  <div className="text-sm font-bold text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ready to transform your genetic screening program?
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Join leading healthcare organizations using Genascope to identify hereditary cancer risk earlier. Schedule a personalized demo today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-600/40"
            >
              Schedule a Demo
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="mailto:contact@genascope.com"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Genascope</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered hereditary cancer risk assessment platform for modern healthcare organizations.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#outcomes" className="hover:text-white transition-colors">Outcomes</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} Genascope. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
