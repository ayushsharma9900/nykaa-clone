'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  Bars4Icon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  isActive: boolean;
  showInMenu: boolean;
  menuOrder: number;
  menuLevel: number;
  parentId?: string;
  children?: MenuItem[];
  productCount?: number;
}

interface DraggableMenuItemProps {
  item: MenuItem;
  index: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, showInMenu: boolean) => void;
  level?: number;
  isChild?: boolean;
}

export default function DraggableMenuItem({
  item,
  index,
  onEdit,
  onDelete,
  onToggleVisibility,
  level = 0,
  isChild = false
}: DraggableMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  
  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 24)}` : '';

  return (
    <Draggable draggableId={item._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white border border-gray-200 rounded-lg mb-2 transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-pink-500' : 'shadow-sm hover:shadow-md'
          } ${indentClass}`}
        >
          {/* Main Item */}
          <div className="flex items-center p-4 space-x-4">
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bars4Icon className="h-5 w-5" />
            </div>

            {/* Expand/Collapse Button for items with children */}
            <div className="flex-shrink-0">
              {hasChildren ? (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-4 h-4" /> // Spacer for alignment
              )}
            </div>

            {/* Item Image */}
            {item.image && (
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-md object-cover border border-gray-200"
                />
              </div>
            )}

            {/* Item Content */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-medium truncate ${
                  item.isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {item.name}
                </h3>
                
                {/* Level indicator */}
                {level > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Level {level}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 truncate max-w-md">
                {item.description}
              </p>
              
              {/* Product count and slug */}
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-400">
                  /{item.slug}
                </span>
                {item.productCount !== undefined && (
                  <span className="text-xs text-gray-400">
                    {item.productCount} products
                  </span>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-2">
              {/* Active Status */}
              <div className={`h-2 w-2 rounded-full ${
                item.isActive ? 'bg-green-400' : 'bg-red-400'
              }`} title={item.isActive ? 'Active' : 'Inactive'} />
              
              {/* Menu Visibility */}
              <div className={`h-2 w-2 rounded-full ${
                item.showInMenu ? 'bg-blue-400' : 'bg-gray-400'
              }`} title={item.showInMenu ? 'Visible in menu' : 'Hidden from menu'} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {/* Toggle Visibility */}
              <button
                onClick={() => onToggleVisibility(item._id, !item.showInMenu)}
                className={`p-1.5 rounded-md transition-colors ${
                  item.showInMenu
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
                title={item.showInMenu ? 'Hide from menu' : 'Show in menu'}
              >
                {item.showInMenu ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
              </button>

              {/* Edit Button */}
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                title="Edit item"
              >
                <PencilIcon className="h-4 w-4" />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(item._id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete item"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Children Items */}
          {hasChildren && isExpanded && (
            <div className="border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <div className="p-2 space-y-1">
                {item.children!.map((child, childIndex) => (
                  <DraggableMenuItem
                    key={child._id}
                    item={child}
                    index={childIndex}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleVisibility={onToggleVisibility}
                    level={level + 1}
                    isChild={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
