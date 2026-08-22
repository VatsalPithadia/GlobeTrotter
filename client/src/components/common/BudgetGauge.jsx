import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BudgetGauge({ spent = 0, budget = 0, currency = '$' }) {
  const numBudget = Number(budget) || 0;
  const numSpent = Number(spent) || 0;
  const percentage = numBudget > 0 ? Math.min(Math.round((numSpent / numBudget) * 100), 100) : 0;
  const isOver = numBudget > 0 && numSpent > numBudget;
  const overAmount = numSpent - numBudget;

  const getBarColor = () => {
    if (isOver) return 'bg-rose-500';
    if (percentage > 85) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Spent: <strong className="text-slate-900 font-semibold">{currency}{numSpent.toLocaleString()}</strong>
        </span>
        <span className="text-slate-500">
          Budget: <strong className="text-slate-900 font-semibold">{numBudget > 0 ? `${currency}${numBudget.toLocaleString()}` : 'Not set'}</strong>
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${numBudget > 0 ? Math.min((numSpent / numBudget) * 100, 100) : 0}%` }}
        />
      </div>

      {numBudget > 0 && (
        <div className="flex items-center justify-between text-[11px]">
          {isOver ? (
            <span className="flex items-center gap-1 text-rose-600 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              Over by {currency}{overAmount.toLocaleString()}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              {currency}{(numBudget - numSpent).toLocaleString()} remaining
            </span>
          )}
          <span className="text-slate-400 font-medium">{percentage}% used</span>
        </div>
      )}
    </div>
  );
}
