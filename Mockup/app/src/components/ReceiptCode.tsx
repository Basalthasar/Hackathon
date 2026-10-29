import { useId, useState } from 'react';
import { Icon } from './Icon';

/**
 * Demo-Empfangsschritt. Der Abschluss einer Lieferung entsteht nicht durch die
 * Ankunft, sondern nur durch den nachvollziehbaren Empfang mit Kunden-Code.
 */
export function ReceiptCode({
  onConfirm,
  compact = false,
}: {
  onConfirm: (code: string) => boolean;
  compact?: boolean;
}) {
  const inputId = useId();
  const [code, setCode] = useState('');

  const submit = () => {
    if (onConfirm(code)) setCode('');
  };

  return (
    <form
      className={compact ? 'receipt-form receipt-form-compact' : 'receipt-form'}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="field" htmlFor={inputId}>
        <span>Empfangscode des Kunden</span>
        <input
          id={inputId}
          value={code}
          autoComplete="off"
          placeholder="D-0000"
          onChange={(event) => setCode(event.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={code.trim().length === 0}>
        <Icon name="check" size={16} /> Empfang bestätigen
      </button>
      {compact ? null : (
        <p className="muted small">
          Die Ankunft ist bereits bestätigt. Erst dieser Schritt schließt die Bestellung ab und zieht die Zahlung ein.
        </p>
      )}
    </form>
  );
}
