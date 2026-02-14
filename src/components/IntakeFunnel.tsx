import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon } from './Icons'

// Form data type
interface FormData {
  insuranceIndustry: string | null
  businessType: string | null
  insuranceLines: string[]
  improvements: string[]
  annualRevenue: string
  leadGeneration: string[]
  website: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface IntakeFunnelProps {
  webhookUrl?: string
  onSubmit?: (data: FormData) => void
  avatarUrl?: string
}

const TOTAL_STEPS = 8

export default function IntakeFunnel({ webhookUrl, onSubmit, avatarUrl }: IntakeFunnelProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    insuranceIndustry: null,
    businessType: null,
    insuranceLines: [],
    improvements: [],
    annualRevenue: '',
    leadGeneration: [],
    website: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const progress = (step / TOTAL_STEPS) * 100

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const goBack = () => setStep(s => Math.max(s - 1, 1))

  const handleSingleSelect = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTimeout(goNext, 300)
  }

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[]
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Call custom onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData)
      }

      // Send to webhook if URL provided
      if (webhookUrl) {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          customFields: [
            { key: 'insurance_industry', value: formData.insuranceIndustry },
            { key: 'business_type', value: formData.businessType },
            { key: 'insurance_lines', value: formData.insuranceLines.join(', ') },
            { key: 'improvements', value: formData.improvements.join(', ') },
            { key: 'annual_revenue', value: formData.annualRevenue || 'Prefer not to answer' },
            { key: 'lead_generation_methods', value: formData.leadGeneration.length > 0 ? formData.leadGeneration.join(', ') : 'None' },
            { key: 'website', value: formData.website || 'No website' }
          ],
          source: 'Intake Funnel',
          tags: ['intake-funnel', 'new-lead']
        }

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="intake-funnel-widget">
        <ProgressBar progress={100} />
        <div className="py-12 px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#8ec5c5' }}>
              <CheckCircleIcon className="w-10 h-10" style={{ color: '#1a2e44' }} />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1a2e44' }}>Thank You!</h2>
            <p className="text-gray-600">We've received your application. Our team will be in touch shortly to schedule a call.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="intake-funnel-widget">
      <ProgressBar progress={progress} />

      <div className="py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden border-4 border-white shadow-lg">
              <img
                src={avatarUrl || ''}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%23666" font-size="40">?</text></svg>'
                }}
              />
            </div>
          </div>

          {/* Steps */}
          {step === 1 && (
            <Step1
              value={formData.insuranceIndustry}
              onSelect={(v) => handleSingleSelect('insuranceIndustry', v)}
            />
          )}
          {step === 2 && (
            <Step2
              value={formData.businessType}
              onSelect={(v) => handleSingleSelect('businessType', v)}
              onBack={goBack}
            />
          )}
          {step === 3 && (
            <Step3
              values={formData.insuranceLines}
              onToggle={(v) => handleMultiSelect('insuranceLines', v)}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 4 && (
            <Step4
              values={formData.improvements}
              onToggle={(v) => handleMultiSelect('improvements', v)}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 5 && (
            <Step5
              value={formData.annualRevenue}
              onChange={(v) => handleInputChange('annualRevenue', v)}
              onNext={goNext}
              onBack={goBack}
              onSkip={goNext}
            />
          )}
          {step === 6 && (
            <Step6
              values={formData.leadGeneration}
              onToggle={(v) => handleMultiSelect('leadGeneration', v)}
              onNext={goNext}
              onBack={goBack}
              onSkip={goNext}
            />
          )}
          {step === 7 && (
            <Step7
              value={formData.website}
              onChange={(v) => handleInputChange('website', v)}
              onNext={goNext}
              onBack={goBack}
              onSkip={goNext}
            />
          )}
          {step === 8 && (
            <Step8
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Progress Bar Component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Step 1: Insurance Industry
function Step1({ value, onSelect }: { value: string | null, onSelect: (v: string) => void }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#1a2e44' }}>
        Do you work in the Insurance industry?
      </h2>
      <p className="text-gray-500 mb-6">Please choose an option</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => onSelect('yes')}
          className={`option-card min-w-[140px] justify-center ${value === 'yes' ? 'selected' : ''}`}
        >
          <CheckCircleIcon className="w-6 h-6" style={{ color: '#1a2e44' }} />
          <span className="font-medium" style={{ color: '#1a2e44' }}>Yes</span>
        </button>
        <button
          onClick={() => onSelect('no')}
          className={`option-card min-w-[140px] justify-center ${value === 'no' ? 'selected' : ''}`}
        >
          <XCircleIcon className="w-6 h-6" style={{ color: '#1a2e44' }} />
          <span className="font-medium" style={{ color: '#1a2e44' }}>No</span>
        </button>
      </div>
    </div>
  )
}

// Step 2: Business Type
function Step2({ value, onSelect, onBack }: { value: string | null, onSelect: (v: string) => void, onBack: () => void }) {
  const options = [
    'Insurance Agency/Brokerage',
    'Independent Agent',
    'Insurance Carrier',
    'Other'
  ]

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#1a2e44' }}>
        Which best describes your business?
      </h2>
      <p className="text-gray-500 mb-6">Please choose an option</p>
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`option-card ${value === option ? 'selected' : ''}`}
          >
            <span className="font-medium" style={{ color: '#1a2e44' }}>{option}</span>
          </button>
        ))}
      </div>
      <button onClick={onBack} className="btn-secondary mt-8 mx-auto">
        <ChevronLeftIcon className="w-5 h-5" />
        Back
      </button>
    </div>
  )
}

// Step 3: Insurance Lines
function Step3({ values, onToggle, onNext, onBack }: {
  values: string[],
  onToggle: (v: string) => void,
  onNext: () => void,
  onBack: () => void
}) {
  const options = ['Life', 'Health', 'Property & Casualty', 'Medicare', 'Commercial', 'Other']

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#1a2e44' }}>
        Select Your Insurance Lines
      </h2>
      <p className="text-gray-500 mb-6">Select all the primary types of insurance you sell</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onToggle(option)}
            className={`option-card-multi ${values.includes(option) ? 'selected' : ''}`}
          >
            <span className="font-medium" style={{ color: '#1a2e44' }}>{option}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={onNext} className="btn-next" disabled={values.length === 0}>
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Step 4: Improvements
function Step4({ values, onToggle, onNext, onBack }: {
  values: string[],
  onToggle: (v: string) => void,
  onNext: () => void,
  onBack: () => void
}) {
  const options = [
    { id: 'leads', title: 'Leads Generation', subtitle: 'Generate More Qualified Leads' },
    { id: 'sales', title: 'Sales', subtitle: 'Convert More Leads Into Sales' },
    { id: 'quality', title: 'Improve Lead Quality', subtitle: 'Increase Contact and Conversion Rate' },
    { id: 'digital', title: 'Digital Presence', subtitle: 'Get discovered by people looking for insurance online' },
  ]

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#1a2e44' }}>
        Where do you feel your firm can improve and do better?
      </h2>
      <p className="text-gray-500 mb-6">Select all that apply</p>
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`option-card-multi text-left ${values.includes(option.id) ? 'selected' : ''}`}
          >
            <div>
              <p className="font-medium" style={{ color: '#1a2e44' }}>{option.title}</p>
              <p className="text-sm text-gray-500">{option.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={onNext} className="btn-next" disabled={values.length === 0}>
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Step 5: Annual Revenue
function Step5({ value, onChange, onNext, onBack, onSkip }: {
  value: string,
  onChange: (v: string) => void,
  onNext: () => void,
  onBack: () => void,
  onSkip: () => void
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1a2e44' }}>
        How much revenue do you generate per year?
      </h2>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>Why are we asking this?</span>
        <span className="text-gray-400">It helps us determine what type of partnership will be the most useful for you</span>
      </div>
      <div className="max-w-md mx-auto">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Annual Revenue"
            className="form-input pl-10"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-left">Confidential</p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={onNext} className="btn-next" disabled={!value}>
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <button onClick={onSkip} className="btn-skip mt-4 mx-auto">
        Prefer not to answer
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// Step 6: Lead Generation Methods
function Step6({ values, onToggle, onNext, onBack, onSkip }: {
  values: string[],
  onToggle: (v: string) => void,
  onNext: () => void,
  onBack: () => void,
  onSkip: () => void
}) {
  const options = [
    { id: 'outbound', title: 'Outbound Prospecting', subtitle: 'Cold calling, Emails, LinkedIn' },
    { id: 'buying', title: 'Buying Leads', subtitle: 'External lead vendors' },
    { id: 'social', title: 'Social Media Ads', subtitle: 'Facebook, Instagram, Youtube, Tiktok, LinkedIn' },
    { id: 'google', title: 'Google Ads', subtitle: 'Search Engine Marketing' },
    { id: 'referrals', title: 'Referrals', subtitle: 'Word of mouth, past clients, family and friends' },
    { id: 'seo', title: 'SEO', subtitle: 'Organic traffic to your website' },
    { id: 'traditional', title: 'Traditional Advertising', subtitle: 'TV, Radio, Billboards' },
    { id: 'organic', title: 'Organic Content', subtitle: 'Social media, Blog, Videos' },
    { id: 'networking', title: 'Networking', subtitle: 'Conferences' },
  ]

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#1a2e44' }}>
        How are you currently generating new leads?
      </h2>
      <p className="text-gray-500 mb-6">Please select all that apply</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`option-card-multi text-left ${values.includes(option.id) ? 'selected' : ''}`}
          >
            <div>
              <p className="font-medium" style={{ color: '#1a2e44' }}>{option.title}</p>
              <p className="text-sm text-gray-500">{option.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={onNext} className="btn-next" disabled={values.length === 0}>
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <button onClick={onSkip} className="btn-skip mt-4 mx-auto">
        None of the above
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// Step 7: Website
function Step7({ value, onChange, onNext, onBack, onSkip }: {
  value: string,
  onChange: (v: string) => void,
  onNext: () => void,
  onBack: () => void,
  onSkip: () => void
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#1a2e44' }}>
        What's your company website?
      </h2>
      <div className="max-w-md mx-auto">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="yourwebsite.com"
            className="form-input pl-12"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-left">If you don't have a website click the button below</p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={onNext} className="btn-next" disabled={!value}>
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <button onClick={onSkip} className="btn-skip mt-4 mx-auto">
        I don't have a website
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// Step 8: Contact Form
function Step8({ formData, onChange, onSubmit, isSubmitting }: {
  formData: FormData,
  onChange: (field: keyof FormData, value: string) => void,
  onSubmit: () => void,
  isSubmitting: boolean
}) {
  const isValid = formData.firstName && formData.lastName && formData.email && formData.phone

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1a2e44' }}>
        How can we connect with you?
      </h2>
      <p className="text-gray-500 mb-8">
        To get your personalized offer and pricing, please enter your details
      </p>
      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="First Name"
            className="form-input"
          />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Last Name"
            className="form-input"
          />
        </div>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="Work Email"
            className="form-input pl-12"
          />
        </div>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+1 000 000 0000"
          className="form-input"
        />
        <button
          onClick={onSubmit}
          className="btn-primary w-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Next: Book a call'}
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-6 max-w-md mx-auto">
        By clicking the button above, you consent for ClientUp Group and partners to use automated technology,
        including pre-recorded messages, cell phones, texts, and emails to contact you at the number and email
        address provided. This includes if the number is currently on any Do Not Call Lists. This consent is
        not required to make a purchase. <a href="/privacy-policy" className="underline">Privacy Policy</a>.
      </p>
    </div>
  )
}
