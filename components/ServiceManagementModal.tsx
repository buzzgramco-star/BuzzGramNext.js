"use client";

import { useState, useEffect } from 'react';
import { addAdminService, updateAdminService } from '@/lib/api';
import type { BusinessService } from '@/types';

interface ServiceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  service?: BusinessService | null; // If provided, edit mode. Otherwise, create mode
  availableServices?: BusinessService[]; // All services for this business (for parent selection)
}

interface ServiceVariation {
  name: string;
  price: string;
  duration: string;
}

interface SubcategoryWithVariations {
  name: string;
  price: string;
  duration: string;
  variations: ServiceVariation[];
}

export default function ServiceManagementModal({ isOpen, onClose, onSuccess, businessId, service, availableServices = [] }: ServiceManagementModalProps) {
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [parentServiceId, setParentServiceId] = useState<number | null>(null);
  const [variations, setVariations] = useState<ServiceVariation[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryWithVariations[]>([]);
  const [use3Level, setUse3Level] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (service) {
      setServiceName(service.serviceName);
      setPrice(service.price || '');
      setDuration(service.duration || '');
      setParentServiceId(service.parentServiceId || null);
      setVariations([]); // Variations only for creating new services
      setSubcategories([]);
      setUse3Level(false);
    } else {
      // Reset form for create mode
      setServiceName('');
      setPrice('');
      setDuration('');
      setParentServiceId(null);
      setVariations([]);
      setSubcategories([]);
      setUse3Level(false);
    }
  }, [service, isOpen]);

  // 2-Level variation functions
  const addVariation = () => {
    setVariations([...variations, { name: '', price: '', duration: '' }]);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: keyof ServiceVariation, value: string) => {
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  const duplicateVariation = (index: number) => {
    const original = variations[index];
    const duplicate = { ...original }; // Shallow copy is fine for flat object
    const updated = [...variations];
    updated.splice(index + 1, 0, duplicate); // Insert right after original
    setVariations(updated);
  };

  // 3-Level subcategory functions
  const addSubcategory = () => {
    setSubcategories([...subcategories, { name: '', price: '', duration: '', variations: [] }]);
  };

  const removeSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const updateSubcategory = (index: number, field: keyof Omit<SubcategoryWithVariations, 'variations'>, value: string) => {
    const updated = [...subcategories];
    updated[index][field] = value;
    setSubcategories(updated);
  };

  const addSubcategoryVariation = (subcategoryIndex: number) => {
    const updated = [...subcategories];
    updated[subcategoryIndex].variations.push({ name: '', price: '', duration: '' });
    setSubcategories(updated);
  };

  const removeSubcategoryVariation = (subcategoryIndex: number, variationIndex: number) => {
    const updated = [...subcategories];
    updated[subcategoryIndex].variations = updated[subcategoryIndex].variations.filter((_, i) => i !== variationIndex);
    setSubcategories(updated);
  };

  const updateSubcategoryVariation = (subcategoryIndex: number, variationIndex: number, field: keyof ServiceVariation, value: string) => {
    const updated = [...subcategories];
    updated[subcategoryIndex].variations[variationIndex][field] = value;
    setSubcategories(updated);
  };

  const duplicateSubcategory = (index: number) => {
    const original = subcategories[index];
    // Deep copy: copy subcategory and all nested variations
    const duplicate: SubcategoryWithVariations = {
      name: original.name,
      price: original.price,
      duration: original.duration,
      variations: original.variations.map(v => ({ ...v })), // Deep copy variations array
    };
    const updated = [...subcategories];
    updated.splice(index + 1, 0, duplicate); // Insert right after original
    setSubcategories(updated);
  };

  const duplicateSubcategoryVariation = (subcategoryIndex: number, variationIndex: number) => {
    const original = subcategories[subcategoryIndex].variations[variationIndex];
    const duplicate = { ...original };
    const updated = [...subcategories];
    updated[subcategoryIndex].variations.splice(variationIndex + 1, 0, duplicate);
    setSubcategories(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (service) {
        // Edit mode
        const serviceData = {
          serviceName,
          price: price || undefined,
          duration: duration || undefined,
          parentServiceId: parentServiceId || undefined,
        };

        // Update the parent service first
        await updateAdminService(businessId, service.id, serviceData);

        // Add subcategories if any (3-level)
        if (subcategories.length > 0) {
          // Validate all subcategories have names
          for (let i = 0; i < subcategories.length; i++) {
            if (!subcategories[i].name.trim()) {
              setError(`Subcategory ${i + 1} must have a name`);
              setLoading(false);
              return;
            }
            // Validate variations within subcategory
            for (let j = 0; j < subcategories[i].variations.length; j++) {
              if (!subcategories[i].variations[j].name.trim()) {
                setError(`Subcategory "${subcategories[i].name}" - Variation ${j + 1} must have a name`);
                setLoading(false);
                return;
              }
            }
          }

          // Create each subcategory as a child service
          for (const subcategory of subcategories) {
            const subcategoryData: any = {
              serviceName: subcategory.name,
              price: subcategory.price || undefined,
              duration: subcategory.duration || undefined,
              parentServiceId: service.id,
            };

            // If subcategory has variations, use the variations array
            if (subcategory.variations.length > 0) {
              subcategoryData.variations = subcategory.variations;
            }

            await addAdminService(businessId, subcategoryData);
          }
        } else if (variations.length > 0) {
          // Add variations (2-level)
          const invalidVariation = variations.find(v => !v.name.trim());
          if (invalidVariation) {
            setError('All variations must have a name');
            setLoading(false);
            return;
          }

          // Create each variation as a child service
          for (const variation of variations) {
            await addAdminService(businessId, {
              serviceName: variation.name,
              price: variation.price || undefined,
              duration: variation.duration || undefined,
              parentServiceId: service.id,
            });
          }
        }
      } else {
        // Create mode
        const serviceData: any = {
          serviceName,
          price: price || undefined,
          duration: duration || undefined,
        };

        // Add subcategories if any exist (3-level)
        if (subcategories.length > 0) {
          // Validate all subcategories have names
          for (let i = 0; i < subcategories.length; i++) {
            if (!subcategories[i].name.trim()) {
              setError(`Subcategory ${i + 1} must have a name`);
              setLoading(false);
              return;
            }
            // Validate variations within subcategory
            for (let j = 0; j < subcategories[i].variations.length; j++) {
              if (!subcategories[i].variations[j].name.trim()) {
                setError(`Subcategory "${subcategories[i].name}" - Variation ${j + 1} must have a name`);
                setLoading(false);
                return;
              }
            }
          }
          serviceData.subcategories = subcategories;
        } else if (variations.length > 0) {
          // Add variations if any exist (2-level)
          const invalidVariation = variations.find(v => !v.name.trim());
          if (invalidVariation) {
            setError('All variations must have a name');
            setLoading(false);
            return;
          }
          serviceData.variations = variations;
        } else {
          // Single service - include parentServiceId
          serviceData.parentServiceId = parentServiceId || undefined;
        }

        await addAdminService(businessId, serviceData);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess(); // Refresh the service list
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        `Failed to ${service ? 'update' : 'add'} service. Please try again.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setServiceName('');
    setPrice('');
    setDuration('');
    setParentServiceId(null);
    setVariations([]);
    setSubcategories([]);
    setUse3Level(false);
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {service ? 'Edit Service' : 'Add New Service'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {service ? 'Update the service information below.' : 'Fill in the details to add a new service.'}
        </p>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Service {service ? 'updated' : 'added'} successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Service Name */}
            <div>
              <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Name *
              </label>
              <input
                id="service-name"
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Full Set Acrylic Nails"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Parent Service (Optional) - Only show when creating single service without variations */}
            {!service && availableServices.length > 0 && variations.length === 0 && (
              <div>
                <label htmlFor="parent-service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Service (Optional)
                </label>
                <select
                  id="parent-service"
                  value={parentServiceId || ''}
                  onChange={(e) => setParentServiceId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">None (Standalone Service)</option>
                  {availableServices
                    .filter(s => !s.parentServiceId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.serviceName}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select a parent to create a service variation (e.g., "Medium" under "Subtle Freestyle")
                </p>
              </div>
            )}

            {/* Info message when editing a child service (variation) */}
            {service && service.parentServiceId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ This is a variation. Edit its parent service to manage the hierarchy.
                </p>
              </div>
            )}

            {/* Info message when editing parent with existing children - informational only */}
            {service && !service.parentServiceId && service.children && service.children.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ This service has {service.children.length} existing variation{service.children.length > 1 ? 's' : ''}. You can add more below.
                </p>
              </div>
            )}

            {/* Service Structure - Show when creating OR editing top-level service (not a child) */}
            {(!service || (service && !service.parentServiceId)) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Service Structure (Optional)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUse3Level(false);
                        setSubcategories([]);
                      }}
                      className={`text-sm px-3 py-1 rounded-lg font-medium transition-colors ${!use3Level && (variations.length > 0 || subcategories.length === 0) ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      2-Level
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUse3Level(true);
                        setVariations([]);
                      }}
                      className={`text-sm px-3 py-1 rounded-lg font-medium transition-colors ${use3Level ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      3-Level
                    </button>
                  </div>
                </div>

                {/* 2-Level Mode: Simple Variations */}
                {!use3Level && (
                  <div>
                    <button
                      type="button"
                      onClick={addVariation}
                      className="w-full text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1 p-2 border border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Variation
                    </button>
                    {variations.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          "{serviceName || 'Service'}" → Short, Medium, Long
                        </p>
                        {variations.map((variation, index) => (
                          <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                required
                                value={variation.name}
                                onChange={(e) => updateVariation(index, 'name', e.target.value)}
                                placeholder="Name*"
                                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <input
                                type="text"
                                value={variation.price}
                                onChange={(e) => updateVariation(index, 'price', e.target.value)}
                                placeholder="Price"
                                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <input
                                type="text"
                                value={variation.duration}
                                onChange={(e) => updateVariation(index, 'duration', e.target.value)}
                                placeholder="Duration"
                                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => duplicateVariation(index)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded"
                              title="Duplicate variation"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVariation(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete variation"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3-Level Mode: Subcategories with Variations */}
                {use3Level && (
                  <div>
                    <button
                      type="button"
                      onClick={addSubcategory}
                      className="w-full text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1 p-2 border border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Subcategory
                    </button>
                    {subcategories.length > 0 && (
                      <div className="space-y-3 mt-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          "{serviceName || 'Main Category'}" → Subcategories → Variations
                        </p>
                        {subcategories.map((subcategory, subIndex) => (
                          <div key={subIndex} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-dark-border">
                            <div className="flex gap-2 items-start mb-2">
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  required
                                  value={subcategory.name}
                                  onChange={(e) => updateSubcategory(subIndex, 'name', e.target.value)}
                                  placeholder="Subcategory Name*"
                                  className="px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <input
                                  type="text"
                                  value={subcategory.price}
                                  onChange={(e) => updateSubcategory(subIndex, 'price', e.target.value)}
                                  placeholder="Price"
                                  className="px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <input
                                  type="text"
                                  value={subcategory.duration}
                                  onChange={(e) => updateSubcategory(subIndex, 'duration', e.target.value)}
                                  placeholder="Duration"
                                  className="px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => duplicateSubcategory(subIndex)}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded"
                                title="Duplicate subcategory"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSubcategory(subIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Delete subcategory"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Variations for this subcategory */}
                            <div className="ml-4 mt-2 space-y-2">
                              <button
                                type="button"
                                onClick={() => addSubcategoryVariation(subIndex)}
                                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Variation
                              </button>
                              {subcategory.variations.map((variation, varIndex) => (
                                <div key={varIndex} className="flex gap-2 items-start p-2 bg-white dark:bg-dark-bg rounded border border-gray-200 dark:border-dark-border">
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      required
                                      value={variation.name}
                                      onChange={(e) => updateSubcategoryVariation(subIndex, varIndex, 'name', e.target.value)}
                                      placeholder="Name*"
                                      className="px-2 py-1 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                    <input
                                      type="text"
                                      value={variation.price}
                                      onChange={(e) => updateSubcategoryVariation(subIndex, varIndex, 'price', e.target.value)}
                                      placeholder="Price"
                                      className="px-2 py-1 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                    <input
                                      type="text"
                                      value={variation.duration}
                                      onChange={(e) => updateSubcategoryVariation(subIndex, varIndex, 'duration', e.target.value)}
                                      placeholder="Duration"
                                      className="px-2 py-1 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => duplicateSubcategoryVariation(subIndex, varIndex)}
                                    className="p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded"
                                    title="Duplicate variation"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeSubcategoryVariation(subIndex, varIndex)}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete variation"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (Optional)
              </label>
              <input
                id="price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., $50 or Starting at $45"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (Optional)
              </label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 1 hour or 45-60 minutes"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (service ? 'Updating...' : 'Adding...') : (service ? 'Update Service' : 'Add Service')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
