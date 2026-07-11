import { StatusHistory, STATUSES } from '../types';
import { motion } from 'framer-motion';
import { Check, Clock, Circle, X } from 'lucide-react';

const allSteps = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'];
const stepIcons: Record<string, any> = { SUBMITTED: Clock, IN_PROGRESS: Circle, RESOLVED: Check };

export default function StatusTimeline({ history, currentStatus }: { history: StatusHistory[]; currentStatus: string }) {
  const currentIdx = allSteps.indexOf(currentStatus);

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="space-y-6">
        {allSteps.map((step, i) => {
          const found = history.find(h => h.status === step);
          const isActive = i <= currentIdx;
          const Icon = stepIcons[step] || Circle;
          const st = STATUSES[step];

          return (
            <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="relative flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-200 text-slate-400'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold text-sm ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{st?.label || step}</h4>
                  {found && <span className="text-xs text-slate-400">{new Date(found.changedAt).toLocaleString()}</span>}
                </div>
                {found?.notes && <p className="text-sm text-slate-500 mt-0.5">{found.notes}</p>}
                {!found && !isActive && <p className="text-sm text-slate-400 mt-0.5">Not yet reached</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
