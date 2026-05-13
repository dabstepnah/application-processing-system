export const Modal = ({
  open,
  title,
  onClose,
  children
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl bg-appCard p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
          <button className="text-textSecondary hover:text-white" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};
