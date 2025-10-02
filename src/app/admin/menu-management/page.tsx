'use client';

import AdminLayout from '../../../components/admin/AdminLayout';
import MenuManager from '../../../components/admin/MenuManager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function MenuManagementPage() {
  const handleAddItem = () => {
    // You can implement a modal or navigate to an add form
    // For now, we'll show an alert
    alert('Add menu item functionality to be implemented. You can extend this to open a modal or navigate to a form.');
  };

  return (
    <AdminLayout title="Menu Management">
      <div className="max-w-7xl mx-auto space-y-6">
        <MenuManager onAddItem={handleAddItem} />
      </div>
    </AdminLayout>
  );
}
