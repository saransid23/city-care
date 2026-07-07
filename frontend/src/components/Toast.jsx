import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const toasts = { list: [], listeners: [] };
const notify = (msg, type = 'success') => {
  const id = Date.now();
  toasts.list = [...toasts.list, { id, msg, type }];
  toasts.listeners.forEach(l => l([...toasts.list]));
  setTimeout(() => {
    toasts.list = toasts.list.filter(t => t.id !== id);
    toasts.listeners.forEach(l => l([...toasts.list]));
  }, 3500);
};

export { notify };

export function ToastContainer() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    toasts.listeners.push(setItems);
    return () => { toasts.listeners = toasts.listeners.filter(l => l !== setItems); };
  }, []);
  if (!items.length) return null;
  return createPortal(
    <div className="toast-container">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✅' : '❌'}</span>
          {t.msg}
        </div>
      ))}
    </div>,
    document.body
  );
}
