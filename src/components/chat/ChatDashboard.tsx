// Chat Dashboard Component - displays strategy list with filtering and pagination

import React, { useState, useMemo } from 'react';
import { StrategyCard } from './StrategyCard';
import { FilterControls, PaginationControls } from './FilterControls';
import type { ChatStrategy } from '../../types/chatConfiguration';
import { buttonStyles } from '../../constants/buttonStyles';

interface ChatDashboardProps {
  strategies: ChatStrategy[];
  loading: boolean;
  onCreateNew: () => void;
  onEdit: (strategy: ChatStrategy) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, currentStatus: boolean) => void;
}

export const ChatDashboard: React.FC<ChatDashboardProps> = ({
  strategies,
  loading,
  onCreateNew,
  onEdit,
  onDelete,
  onToggle
}) => {
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 cards per page for nice grid layout

  // Get unique specialties for filter dropdown
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set(
      strategies
        .map(s => s.specialty)
        .filter((specialty): specialty is string => Boolean(specialty))
    );
    return Array.from(uniqueSpecialties);
  }, [strategies]);

  // Filter strategies based on search and filters
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           strategy.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && strategy.is_active) ||
                           (statusFilter === 'draft' && !strategy.is_active);
      
      const matchesSpecialty = specialtyFilter === 'all' || strategy.specialty === specialtyFilter;
      
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [strategies, searchTerm, statusFilter, specialtyFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStrategies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStrategies = filteredStrategies.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, specialtyFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading strategies...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat Strategies</h2>
          <p className="text-gray-600 mt-1">Manage your AI chat configurations</p>
        </div>
        <button
          onClick={onCreateNew}
          className={buttonStyles.primary}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create New Strategy</span>
        </button>
      </div>

      {/* Filter Controls */}
      <FilterControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        specialtyFilter={specialtyFilter}
        onSpecialtyFilterChange={setSpecialtyFilter}
        specialties={specialties}
      />

      {/* Strategies Grid */}
      {filteredStrategies.length === 0 ? (
        <div className="text-center py-12">
          {strategies.length === 0 ? (
            <div>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No strategies yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first chat strategy.</p>
              <button
                onClick={onCreateNew}
                className={buttonStyles.primary}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Your First Strategy</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No strategies found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSpecialtyFilter('all');
                }}
                className={buttonStyles.secondary}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={Math.min(startIndex + itemsPerPage, filteredStrategies.length)}
            totalItems={filteredStrategies.length}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
};
