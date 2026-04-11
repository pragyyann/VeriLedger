import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, History, Library, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuickAction = {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
};

type Activity = {
  icon: React.ReactNode; 
  title: string;
  time: string;
  amount: number;
};

type Service = {
  icon: React.ElementType;
  title: string;
  description: string;
  isPremium?: boolean;
  hasAction?: boolean;
};

interface FinancialDashboardProps {
  quickActions: QuickAction[];
  recentActivity: Activity[];
  financialServices: Service[];
}

const IconWrapper = ({
  icon: Icon,
  className,
}: {
  icon: React.ElementType;
  className?: string;
}) => (
  <div
    className={cn(
      'p-2 rounded-full flex items-center justify-center',
      className
    )}
  >
    <Icon className="w-5 h-5" />
  </div>
);

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  quickActions,
  recentActivity,
  financialServices,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-[#111827]/80 backdrop-blur-md text-white rounded-2xl border border-gray-800 shadow-xl max-w-2xl mx-auto font-sans relative z-10 w-full"
    >
      <div className="p-4 md:p-6">
        <motion.div variants={itemVariants} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions, payments, or type a command..."
            className="bg-[#0B0F19] w-full border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center justify-center text-xs font-mono text-gray-500 bg-gray-800 p-1 rounded-md">
            ⌘K
          </kbd>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(55, 65, 81, 0.4)' }}
              onClick={action.onClick}
              className={`group text-center p-3 rounded-xl transition-colors ${action.onClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <IconWrapper
                icon={action.icon}
                className="mx-auto mb-2 bg-gray-800 group-hover:bg-primary text-gray-300"
              />
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-xs text-gray-400">
                {action.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-semibold">Recent activity</h2>
          </div>
          <motion.ul
            variants={containerVariants}
            className="space-y-4"
          >
            {recentActivity.map((activity, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {React.isValidElement(activity.icon) ? (
                    activity.icon
                  ) : (
                    <IconWrapper
                      icon={activity.icon as React.ElementType}
                      className="bg-gray-800 text-gray-400"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-sm font-mono p-1 px-2 rounded',
                    activity.amount > 0
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-red-400 bg-red-500/10'
                  )}
                >
                  {activity.amount > 0 ? '+' : '-'}$
                  {Math.abs(activity.amount).toFixed(2)}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Library className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-semibold">Financial services</h2>
          </div>
          <motion.div
            variants={containerVariants}
            className="space-y-2"
          >
            {financialServices.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: 'rgba(55, 65, 81, 0.4)',
                }}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <IconWrapper
                    icon={service.icon}
                    className="bg-gray-700 text-gray-300"
                  />
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {service.title}
                      {service.isPremium && (
                        <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                          Premium
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {service.description}
                    </p>
                  </div>
                </div>
                {service.hasAction && (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
