import { CheckCircle } from 'lucide-react';

export default function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-fade-in">
      <CheckCircle size={20} className="text-white" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
