import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {[1, 2, 3, 4].map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`w-8 h-8 flex items-center justify-center text-xs font-light tracking-wider border transition-all ${currentStep === s ? 'bg-white text-black border-white' : currentStep > s ? 'bg-white/20 border-white/20 text-white' : 'border-white/10 text-gray-600'}`}>
            {currentStep > s ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
          {i < 3 && <div className={`flex-1 h-px transition-all ${currentStep > s ? 'bg-white/30' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  )
}
