import React, { useState, useEffect, useRef } from 'react';
import { Check, SendIcon, Loader2, AlertCircle, Search, ChevronDown, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { Retailer, FormData } from './types';

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    retailerName: '',
    email: '',
    interestedInEVHC: 'Yes', // Set default value to avoid validation issues
    question: '',
    // New fields with default values
    currentProcess: '',
    processEffectiveness: 0,
    challenges: [],
    missedOpportunities: '',
    automationInterest: '',
    automationInterestComments: '',
    valuableFeatures: [],
    expectedBenefits: [],
    investmentWillingness: '',
    hasConcerns: '', // Changed from concerns string to hasConcerns yes/no field
    concernDetails: '', // Added new field for concern details
    evhcProvider: '', // New field for eVHC provider
    otherEvhcProvider: '', // New field for other eVHC provider
    additionalFeedback: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Retailer dropdown state
  const [isRetailerDropdownOpen, setIsRetailerDropdownOpen] = useState(false);
  const [retailerSearchQuery, setRetailerSearchQuery] = useState('');
  const retailerDropdownRef = useRef<HTMLDivElement>(null);
  const retailerInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Filter retailers based on search query
  const filteredRetailers = retailers.filter(retailer => 
    retailer.name.toLowerCase().includes(retailerSearchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchRetailers() {
      try {
        const { data, error } = await supabase
          .from('retailers')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching retailers:', error);
          setError('Failed to load retailers. Please try again later.');
        } else {
          setRetailers(data || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRetailers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (retailerDropdownRef.current && !retailerDropdownRef.current.contains(event.target as Node)) {
        setIsRetailerDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent accidental form submission when Enter key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target instanceof HTMLElement) {
        // Allow Enter in textareas
        if (e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear validation error for this field when it's changed
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Mark field as touched when changed
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setFormData(prevData => {
      const currentValues = prevData[name as keyof FormData] as string[];
      
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          // Remove the value if it's already in the array
          return {
            ...prevData,
            [name]: currentValues.filter(item => item !== value)
          };
        } else {
          // Add the value if it's not in the array
          return {
            ...prevData,
            [name]: [...currentValues, value]
          };
        }
      } else {
        // Initialize as array with the single value if not already an array
        return {
          ...prevData,
          [name]: [value]
        };
      }
    });
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Mark field as touched when changed
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleRatingChange = (value: number) => {
    setFormData(prevData => ({
      ...prevData,
      processEffectiveness: value
    }));
    
    // Clear validation error
    if (validationErrors.processEffectiveness) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated.processEffectiveness;
        return updated;
      });
    }

    // Mark field as touched when changed
    setTouched(prev => ({
      ...prev,
      processEffectiveness: true
    }));
  };

  const handleRetailerSelect = (retailerName: string) => {
    setFormData(prevData => ({
      ...prevData,
      retailerName
    }));
    setRetailerSearchQuery('');
    setIsRetailerDropdownOpen(false);
    
    // Clear validation error
    if (validationErrors.retailerName) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated.retailerName;
        return updated;
      });
    }
    
    // Mark as touched
    setTouched(prev => ({
      ...prev,
      retailerName: true
    }));
  };

  const clearRetailerSelection = () => {
    setFormData(prevData => ({
      ...prevData,
      retailerName: ''
    }));
    setRetailerSearchQuery('');
    
    if (retailerInputRef.current) {
      retailerInputRef.current.focus();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Only validate on blur if the field is explicitly marked as touched
    if (touched[name]) {
      validateField(name, formData[name as keyof FormData] as string);
    }
  };

  const validateField = (name: string, value: string | any) => {
    if (name === 'automationInterestComments' || name === 'additionalFeedback' || 
        name === 'evhcProvider' || name === 'otherEvhcProvider') {
      // These fields are optional
      return true;
    }

    if (name === 'concernDetails' && formData.hasConcerns === 'Yes' && (!value || value.trim() === '')) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: 'Please provide details about your concerns'
      }));
      return false;
    }
    
    if (!value || (typeof value === 'string' && value.trim() === '') || 
        (Array.isArray(value) && value.length === 0) ||
        (name === 'processEffectiveness' && value === 0)) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`
      }));
      return false;
    }
    
    if (name === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: 'Please enter a valid email address'
      }));
      return false;
    }
    
    return true;
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (step === 1) {
      // Validate first step fields
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
      
      if (!formData.role.trim()) {
        newErrors.role = 'Role is required';
        isValid = false;
      }
      
      if (!formData.retailerName) {
        newErrors.retailerName = 'Retailer Name is required';
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    } else if (step === 2) {
      // Validate second step fields
      if (!formData.currentProcess) {
        newErrors.currentProcess = 'Please select an option';
        isValid = false;
      }
      
      if (formData.processEffectiveness === 0) {
        newErrors.processEffectiveness = 'Please rate your current process';
        isValid = false;
      }
      
      if (formData.challenges.length === 0) {
        newErrors.challenges = 'Please select at least one challenge';
        isValid = false;
      }
      
      if (!formData.missedOpportunities) {
        newErrors.missedOpportunities = 'Please select an option';
        isValid = false;
      }
    } else if (step === 3) {
      // Validate third step fields
      if (!formData.automationInterest) {
        newErrors.automationInterest = 'Please select an option';
        isValid = false;
      }
      
      if (formData.valuableFeatures.length === 0) {
        newErrors.valuableFeatures = 'Please select at least one feature';
        isValid = false;
      }
      
      if (formData.expectedBenefits.length === 0) {
        newErrors.expectedBenefits = 'Please select at least one benefit';
        isValid = false;
      }
      
      if (!formData.investmentWillingness) {
        newErrors.investmentWillingness = 'Please select an option';
        isValid = false;
      }
    } else if (step === 4) {
      // Validate if hasConcerns has been selected
      if (!formData.hasConcerns) {
        newErrors.hasConcerns = 'Please select Yes or No';
        isValid = false;
      }
      
      // If user has concerns, make sure they provided details
      if (formData.hasConcerns === 'Yes' && !formData.concernDetails.trim()) {
        newErrors.concernDetails = 'Please provide details about your concerns';
        isValid = false;
      }
    }
    
    setValidationErrors(newErrors);
    
    // Mark fields as touched if there are errors
    if (!isValid) {
      const touchedFields: Record<string, boolean> = {};
      Object.keys(newErrors).forEach(field => {
        touchedFields[field] = true;
      });
      setTouched(prev => ({
        ...prev,
        ...touchedFields
      }));
    }
    
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      window.scrollTo(0, 0);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep(currentStep - 1);
  };

  const validateForm = () => {
    return validateStep(currentStep);
  };

  const handleExplicitSubmit = async () => {
    // Only allow explicit submission from the submit button
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Find the retailer ID based on the selected retailer name
      const selectedRetailer = retailers.find(retailer => retailer.name === formData.retailerName);
      
      if (!selectedRetailer) {
        throw new Error('Selected retailer not found');
      }
      
      // Insert the form submission into the database
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          name: formData.name,
          role: formData.role,
          retailer_id: selectedRetailer.id,
          email: formData.email,
          interested_in_evhc: formData.interestedInEVHC === 'Yes',
          current_process: formData.currentProcess,
          process_effectiveness: formData.processEffectiveness,
          challenges: formData.challenges.join(', '),
          missed_opportunities: formData.missedOpportunities,
          automation_interest: formData.automationInterest,
          automation_interest_comments: formData.automationInterestComments,
          valuable_features: formData.valuableFeatures.join(', '),
          expected_benefits: formData.expectedBenefits.join(', '),
          investment_willingness: formData.investmentWillingness,
          concerns: formData.hasConcerns === 'Yes' ? formData.concernDetails : '', // Store concern details only if they have concerns
          additional_feedback: formData.additionalFeedback
        });
        
      if (error) {
        console.error('Error saving form data:', error);
        throw new Error('Failed to save your response. Please try again.');
      }
      
      console.log('Form submitted successfully:', formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // This prevents any form submissions that might happen automatically
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Don't do anything here - we'll only submit via the explicit button click
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your response has been submitted successfully. We appreciate you taking the time to provide your feedback.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form Step 1 - Basic Information
  const renderStep1 = () => (
    <>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={`w-full px-3 py-2 border ${validationErrors.name && touched.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {validationErrors.name && touched.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.name}
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={`w-full px-3 py-2 border ${validationErrors.role && touched.role ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {validationErrors.role && touched.role && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.role}
          </p>
        )}
      </div>
      
      <div className="mb-4" ref={retailerDropdownRef}>
        <label htmlFor="retailerSearch" className="block text-sm font-medium text-gray-700 mb-1">
          Retailer Name <span className="text-red-500">*</span>
        </label>
        
        {/* Custom searchable dropdown */}
        <div className="relative">
          {/* Selected retailer display or search input */}
          <div 
            className={`flex items-center w-full px-3 py-2 border ${validationErrors.retailerName && touched.retailerName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-pointer`}
            onClick={() => setIsRetailerDropdownOpen(true)}
          >
            {formData.retailerName ? (
              <>
                <span className="flex-1">{formData.retailerName}</span>
                <button 
                  type="button" 
                  className="ml-2 text-gray-400 hover:text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearRetailerSelection();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  ref={retailerInputRef}
                  type="text"
                  id="retailerSearch"
                  placeholder="Search retailers..."
                  value={retailerSearchQuery}
                  onChange={(e) => setRetailerSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setIsRetailerDropdownOpen(true)}
                  className="flex-1 outline-none bg-transparent"
                />
              </>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isRetailerDropdownOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {/* Dropdown menu */}
          {isRetailerDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1" />
                  Loading retailers...
                </div>
              ) : filteredRetailers.length > 0 ? (
                filteredRetailers.map((retailer) => (
                  <div
                    key={retailer.id}
                    className={`p-2 hover:bg-blue-50 cursor-pointer ${formData.retailerName === retailer.name ? 'bg-blue-100' : ''}`}
                    onClick={() => handleRetailerSelect(retailer.name)}
                  >
                    {retailer.name}
                    {formData.retailerName === retailer.name && (
                      <Check className="h-4 w-4 text-blue-600 inline ml-2" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No retailers found matching "{retailerSearchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        
        {validationErrors.retailerName && touched.retailerName && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.retailerName}
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={`w-full px-3 py-2 border ${validationErrors.email && touched.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {validationErrors.email && touched.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationErrors.email}
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-3">
          <p className="mb-2">As you will know, every missed follow-up on a vehicle health check is a missed opportunity for revenue and customer satisfaction.</p>
          <p className="mb-2">The existing MOTION system can be expanded to really help with this by having fully automated additional functionality of contacting customers with deferred eVHC work that you have previously identified.</p>
          <p className="mb-2">Having an automated eVHC Follow-up and Reporting solution allows consolidation of detailed eVHC data into a single platform which in this case would be MOTION, boosting your revenue and retention with little effort.</p>
          <p className="mb-3">The fully automated follow-up process runs in the background daily, which free's your aftersales team from manual tasks while unlocking the full potential of every eVHC personalised to your retailer using official Stellantis branding of the vehicle targeted.</p>
        </div>
      </div>
    </>
  );

  // Form Step 2 - Current Process & Challenges
  const renderStep2 = () => (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Current Process & Efficiency</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do you currently manage eVHC follow-ups? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Manually', 'Partially automated', 'Fully automated', 'No follow-up process'].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="radio"
                  name="currentProcess"
                  value={option}
                  checked={formData.currentProcess === option}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.currentProcess && touched.currentProcess && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.currentProcess}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How effective is your current follow-up process? <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Very Ineffective</div>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingChange(rating)}
                className={`w-10 h-10 rounded-full ${
                  formData.processEffectiveness === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } flex items-center justify-center font-medium transition-colors`}
              >
                {rating}
              </button>
            ))}
            <div className="text-sm text-gray-500">Very Effective</div>
          </div>
          {validationErrors.processEffectiveness && touched.processEffectiveness && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.processEffectiveness}
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Challenges & Pain Points</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are the biggest challenges you face with eVHC follow-ups? <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 mt-1">(Select all that apply)</span>
          </label>
          <div className="space-y-2">
            {['Time-consuming', 'Low customer response', 'Lack of tracking', 'Insufficient staff', 'Complex procedures', 'Inadequate tools/software', 'Other'].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.challenges.includes(option)}
                  onChange={() => handleCheckboxChange('challenges', option)}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.challenges && touched.challenges && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.challenges}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How often do you miss potential service/repair opportunities due to incomplete follow-ups? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="radio"
                  name="missedOpportunities"
                  value={option}
                  checked={formData.missedOpportunities === option}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.missedOpportunities && touched.missedOpportunities && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.missedOpportunities}
            </p>
          )}
        </div>
      </div>
    </>
  );

  // Form Step 3 - Automation Interest & Benefits
  const renderStep3 = () => (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Interest & Readiness for Automation</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Would you be interested in an automated solution to manage eVHC follow-ups? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Yes', 'No', 'Maybe'].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="radio"
                  name="automationInterest"
                  value={option}
                  checked={formData.automationInterest === option}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.automationInterest && touched.automationInterest && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.automationInterest}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="automationInterestComments" className="block text-sm font-medium text-gray-700 mb-1">
            Comments (Optional)
          </label>
          <textarea
            id="automationInterestComments"
            name="automationInterestComments"
            value={formData.automationInterestComments}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please share any additional thoughts..."
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What features would be most valuable in an automated follow-up system? <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 mt-1">(Select all that apply)</span>
          </label>
          <div className="space-y-2">
            {[
              'Real-time tracking', 
              'Automated customer reminders', 
              'Reporting & analytics',
              'Seamless integration with existing systems',
              'Customizable templates',
              'Multi-channel communication (email, SMS, etc.)',
              'Customer response tracking',
              'Task assignment to staff',
              'Other'
            ].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.valuableFeatures.includes(option)}
                  onChange={() => handleCheckboxChange('valuableFeatures', option)}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.valuableFeatures && touched.valuableFeatures && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.valuableFeatures}
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Expected Benefits & ROI</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What benefits do you expect from an automated eVHC follow-up system? <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 mt-1">(Select all that apply)</span>
          </label>
          <div className="space-y-2">
            {[
              'Increased revenue', 
              'Better customer retention', 
              'Reduced manual workload',
              'Improved efficiency',
              'More consistent follow-ups',
              'Better data insights',
              'Improved customer satisfaction',
              'Reduced operational costs',
              'Other'
            ].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.expectedBenefits.includes(option)}
                  onChange={() => handleCheckboxChange('expectedBenefits', option)}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.expectedBenefits && touched.expectedBenefits && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.expectedBenefits}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Would you be willing to invest in a system that automates eVHC follow-ups if it increases revenue and customer satisfaction? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Yes', 'No', 'Depends on cost and ROI'].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="radio"
                  name="investmentWillingness"
                  value={option}
                  checked={formData.investmentWillingness === option}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.investmentWillingness && touched.investmentWillingness && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.investmentWillingness}
            </p>
          )}
        </div>
      </div>
    </>
  );

  // Form Step 4 - Additional Feedback
  const renderStep4 = () => (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5. Additional Feedback</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you have any concerns about implementing an automated eVHC follow-up system? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Yes', 'No'].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="radio"
                  name="hasConcerns"
                  value={option}
                  checked={formData.hasConcerns === option}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.hasConcerns && touched.hasConcerns && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationErrors.hasConcerns}
            </p>
          )}
        </div>
        
        {/* Conditionally render concern details field */}
        {formData.hasConcerns === 'Yes' && (
          <div className="mb-6">
            <label htmlFor="concernDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Please share your concerns <span className="text-red-500">*</span>
            </label>
            <textarea
              id="concernDetails"
              name="concernDetails"
              value={formData.concernDetails}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className={`w-full px-3 py-2 border ${validationErrors.concernDetails && touched.concernDetails ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Please share details about your concerns..."
            />
            {validationErrors.concernDetails && touched.concernDetails && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.concernDetails}
              </p>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="additionalFeedback" className="block text-sm font-medium text-gray-700 mb-1">
            Any other suggestions or feedback?
          </label>
          <textarea
            id="additionalFeedback"
            name="additionalFeedback"
            value={formData.additionalFeedback}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please share any additional suggestions or feedback..."
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <img 
            src="https://njlzvvvjahamdzpkuwcs.supabase.co/storage/v1/object/public/Images//stellantis.png" 
            alt="Stellantis Logo" 
            className="h-12 mr-auto" 
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Stellantis eVHC - Automated Follow Up Survey</h1>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  {step === 1 ? 'Basics' : 
                   step === 2 ? 'Process & Challenges' : 
                   step === 3 ? 'Automation & ROI' : 'Feedback'}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Use div instead of form to avoid implicit form submission */}
        <div onSubmit={handleSubmit} className="form-container">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                ref={submitButtonRef}
                onClick={handleExplicitSubmit}
                disabled={submitting}
                className="ml-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;