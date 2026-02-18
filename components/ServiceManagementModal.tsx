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

export default function ServiceManagementModal({ isOpen, onClose, onSuccess, businessId, service, availableServices = [] }: ServiceManagementModalProps) {
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [parentServiceId, setParentServiceId] = useState<number | null>(null);
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
    } else {
      // Reset form for create mode
      setServiceName('');
      setPrice('');
      setDuration('');
      setParentServiceId(null);
    }
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const serviceData = {
        serviceName,
        price: price || undefined,
        duration: duration || undefined,
        parentServiceId: parentServiceId || undefined,
      };

      if (service) {
        // Edit mode
        await updateAdminService(businessId, service.id, serviceData);
      } else {
        // Create mode
        await addAdminService(businessId, serviceData as any);
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
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-lg w-full p-6 relative">
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

            {/* Parent Service (Optional) */}
            {availableServices.length > 0 && (
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
                    .filter(s => !s.parentServiceId && s.id !== service?.id)
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
